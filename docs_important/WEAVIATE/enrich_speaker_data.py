#!/usr/bin/env python3
"""
Speaker Data Enrichment Script
------------------------------
Enriches the Speaker collection with comprehensive profile data from
backend_data/speakers/snt2025_speaker_profiles.json

This includes:
- Full biographical information
- Research expertise and focus areas
- CTBTO involvement details
- Publication records
- Contact information

Usage:
    python enrich_speaker_data.py --enrich
    python enrich_speaker_data.py --verify
    python enrich_speaker_data.py --stats
"""

import os
import json
import weaviate
from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
from weaviate.util import generate_uuid5
import argparse
import re

class SpeakerDataEnricher:
    """Enriches Speaker collection with comprehensive profile data"""
    
    def __init__(self):
        self.load_config()
        self.client = self.connect_weaviate()
        self.enrichment_id = f"enrichment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def load_config(self):
        """Load environment configuration"""
        script_dir = os.path.dirname(os.path.realpath(__file__))
        dotenv_path = os.path.join(script_dir, '..', '..', '..', 'frontend', '.env')
        load_dotenv(dotenv_path=dotenv_path)
        
        self.config = {
            "WEAVIATE_URL": os.getenv('WEAVIATE_URL'),
            "WEAVIATE_API_KEY": os.getenv('WEAVIATE_API_KEY'),
            "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY'),
            "DATA_PATH": os.path.join(script_dir, '..', '..', '..', 'backend', 'backend_data')
        }
        
        if not all([self.config["WEAVIATE_URL"], self.config["WEAVIATE_API_KEY"]]):
            raise ValueError('Missing Weaviate configuration in .env file')
    
    def connect_weaviate(self):
        """Connect to Weaviate Cloud instance"""
        return weaviate.connect_to_weaviate_cloud(
            cluster_url=self.config["WEAVIATE_URL"],
            auth_credentials=weaviate.auth.AuthApiKey(self.config["WEAVIATE_API_KEY"]),
            headers={'X-OpenAI-Api-Key': self.config["OPENAI_API_KEY"]}
        )

    def load_speaker_profiles(self) -> Dict[str, Any]:
        """Load rich speaker profiles from JSON"""
        speakers_file = os.path.join(
            self.config["DATA_PATH"], 
            'speakers', 
            'snt2025_speaker_profiles.json'
        )
        
        if not os.path.exists(speakers_file):
            raise FileNotFoundError(f"Speaker profiles not found: {speakers_file}")
        
        with open(speakers_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def normalize_speaker_name(self, name: str) -> str:
        """Normalize speaker name for matching"""
        # Remove titles and normalize spacing
        name = re.sub(r'^(Mr|Ms|Dr|Prof)\.?\s*', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s+', ' ', name.strip())
        return name.lower()

    def create_enriched_speaker_profile(self, speaker_data: Dict) -> Dict[str, Any]:
        """Convert JSON speaker data to enriched Weaviate properties"""
        profile = speaker_data.get('profile', {})
        presentation = speaker_data.get('presentation', {})
        
        # Extract expertise from profile
        expertise = profile.get('expertise', [])
        if isinstance(expertise, str):
            expertise = [expertise]
        
        # Extract publications
        publications = profile.get('key_publications', [])
        if isinstance(publications, str):
            publications = [publications]
        
        # Build comprehensive bio from profile data
        bio_parts = []
        if profile.get('current_position'):
            bio_parts.append(f"Current Position: {profile['current_position']}")
        if profile.get('rank'):
            bio_parts.append(f"Rank: {profile['rank']}")
        if profile.get('research_focus'):
            bio_parts.append(f"Research Focus: {profile['research_focus']}")
        
        bio = '. '.join(bio_parts)
        
        # Extract CTBTO involvement
        ctbto_involvement = ""
        if 'ctbto_involvement' in profile:
            ctbto_data = profile['ctbto_involvement']
            role = ctbto_data.get('role', '')
            contributions = ctbto_data.get('contributions', [])
            conferences = ctbto_data.get('conferences', [])
            
            ctbto_parts = []
            if role:
                ctbto_parts.append(f"Role: {role}")
            if contributions:
                ctbto_parts.append(f"Contributions: {len(contributions)} key contributions")
            if conferences:
                ctbto_parts.append(f"Conferences: {', '.join(conferences)}")
            
            ctbto_involvement = '. '.join(ctbto_parts)
        
        # Build contact info
        contact_parts = []
        for field in ['linkedin', 'website', 'google_scholar']:
            if profile.get(field):
                contact_parts.append(f"{field.replace('_', ' ').title()}: {profile[field]}")
        contact_info = '. '.join(contact_parts)
        
        return {
            'name': speaker_data['name'],
            'title': speaker_data.get('title', ''),
            'affiliation': profile.get('affiliation', ''),
            'bio': bio,
            'expertise': expertise,
            'researchFocus': profile.get('research_focus', ''),
            'totalSessions': 1 if presentation else 0,  # Will be updated later with session count
            'ctbtoInvolvement': ctbto_involvement,
            'keyPublications': publications,
            'contactInfo': contact_info,
            'embeddingModel': 'text-embedding-3-small',
            'lastUpdated': datetime.now(timezone.utc)
        }

    def get_existing_speakers(self) -> Dict[str, str]:
        """Get existing speakers from Weaviate with their UUIDs"""
        if not self.client.collections.exists('Speaker'):
            print("❌ Speaker collection does not exist. Run schema migration first.")
            return {}
        
        speaker_collection = self.client.collections.get('Speaker')
        response = speaker_collection.query.fetch_objects(
            limit=1000,
            return_properties=['name']
        )
        
        existing_speakers = {}
        for obj in response.objects:
            normalized_name = self.normalize_speaker_name(obj.properties['name'])
            existing_speakers[normalized_name] = str(obj.uuid)
        
        return existing_speakers

    def calculate_session_counts(self) -> Dict[str, int]:
        """Calculate total sessions per speaker from Session collection"""
        session_counts = {}
        
        if not self.client.collections.exists('Session'):
            print("⚠️  Session collection not found, using default session counts")
            return session_counts
        
        session_collection = self.client.collections.get('Session')
        response = session_collection.query.fetch_objects(
            limit=1000,
            return_references=[
                wvc_query.QueryReference(
                    link_on='speakers',
                    return_properties=['name']
                )
            ]
        )
        
        for session in response.objects:
            if hasattr(session, 'references') and 'speakers' in session.references:
                for speaker_ref in session.references['speakers'].objects:
                    speaker_name = speaker_ref.properties['name']
                    normalized_name = self.normalize_speaker_name(speaker_name)
                    session_counts[normalized_name] = session_counts.get(normalized_name, 0) + 1
        
        return session_counts

    def enrich_speaker_data(self) -> Dict[str, Any]:
        """Main enrichment process"""
        print(f"\n[{self.enrichment_id}] Starting speaker data enrichment...")
        
        # Load data
        speaker_profiles = self.load_speaker_profiles()
        existing_speakers = self.get_existing_speakers()
        session_counts = self.calculate_session_counts()
        
        speaker_collection = self.client.collections.get('Speaker')
        
        enrichment_stats = {
            'total_profiles': len(speaker_profiles['speakers']),
            'matched_speakers': 0,
            'new_speakers': 0,
            'updated_speakers': 0,
            'failed_updates': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"  Loaded {enrichment_stats['total_profiles']} speaker profiles")
        print(f"  Found {len(existing_speakers)} existing speakers in Weaviate")
        
        # Process each speaker profile
        with speaker_collection.batch.dynamic() as batch:
            for speaker_data in speaker_profiles['speakers']:
                try:
                    enriched_profile = self.create_enriched_speaker_profile(speaker_data)
                    normalized_name = self.normalize_speaker_name(speaker_data['name'])
                    
                    # Update session count if available
                    if normalized_name in session_counts:
                        enriched_profile['totalSessions'] = session_counts[normalized_name]
                    
                    if normalized_name in existing_speakers:
                        # Update existing speaker
                        speaker_uuid = existing_speakers[normalized_name]
                        speaker_collection.data.update(
                            uuid=speaker_uuid,
                            properties=enriched_profile
                        )
                        enrichment_stats['updated_speakers'] += 1
                        enrichment_stats['matched_speakers'] += 1
                        print(f"  ✓ Updated: {speaker_data['name']}")
                        
                    else:
                        # Create new speaker
                        speaker_uuid = generate_uuid5(f"speaker-{speaker_data['name']}")
                        batch.add_object(
                            properties=enriched_profile,
                            uuid=speaker_uuid
                        )
                        enrichment_stats['new_speakers'] += 1
                        print(f"  + Created: {speaker_data['name']}")
                        
                except Exception as e:
                    print(f"  ❌ Failed to process {speaker_data.get('name', 'Unknown')}: {e}")
                    enrichment_stats['failed_updates'] += 1
        
        # Save enrichment log
        log_file = f"speaker_enrichment_log_{self.enrichment_id}.json"
        with open(log_file, 'w') as f:
            json.dump(enrichment_stats, f, indent=2)
        
        print(f"\n✅ Speaker enrichment completed!")
        print(f"  Matched: {enrichment_stats['matched_speakers']}")
        print(f"  Updated: {enrichment_stats['updated_speakers']}")
        print(f"  Created: {enrichment_stats['new_speakers']}")
        print(f"  Failed: {enrichment_stats['failed_updates']}")
        print(f"  Log saved: {log_file}")
        
        return enrichment_stats

    def verify_enrichment(self) -> Dict[str, Any]:
        """Verify enrichment was successful"""
        print(f"\n[{self.enrichment_id}] Verifying speaker enrichment...")
        
        if not self.client.collections.exists('Speaker'):
            return {'error': 'Speaker collection does not exist'}
        
        speaker_collection = self.client.collections.get('Speaker')
        response = speaker_collection.query.fetch_objects(limit=100)
        
        verification_stats = {
            'total_speakers': len(response.objects),
            'enriched_speakers': 0,
            'speakers_with_expertise': 0,
            'speakers_with_bio': 0,
            'speakers_with_publications': 0,
            'speakers_with_ctbto': 0,
            'average_expertise_count': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        expertise_counts = []
        
        for speaker in response.objects:
            props = speaker.properties
            
            # Check if speaker has enriched data
            has_enriched_data = any([
                props.get('expertise'),
                props.get('bio'),
                props.get('researchFocus'),
                props.get('keyPublications'),
                props.get('ctbtoInvolvement')
            ])
            
            if has_enriched_data:
                verification_stats['enriched_speakers'] += 1
            
            if props.get('expertise'):
                verification_stats['speakers_with_expertise'] += 1
                expertise_counts.append(len(props['expertise']))
            
            if props.get('bio'):
                verification_stats['speakers_with_bio'] += 1
                
            if props.get('keyPublications'):
                verification_stats['speakers_with_publications'] += 1
                
            if props.get('ctbtoInvolvement'):
                verification_stats['speakers_with_ctbto'] += 1
        
        if expertise_counts:
            verification_stats['average_expertise_count'] = sum(expertise_counts) / len(expertise_counts)
        
        # Print verification results
        print(f"  Total speakers: {verification_stats['total_speakers']}")
        print(f"  Enriched speakers: {verification_stats['enriched_speakers']}")
        print(f"  With expertise: {verification_stats['speakers_with_expertise']}")
        print(f"  With bio: {verification_stats['speakers_with_bio']}")
        print(f"  With publications: {verification_stats['speakers_with_publications']}")
        print(f"  With CTBTO involvement: {verification_stats['speakers_with_ctbto']}")
        print(f"  Avg expertise areas: {verification_stats['average_expertise_count']:.1f}")
        
        return verification_stats

    def get_enrichment_stats(self) -> Dict[str, Any]:
        """Get detailed statistics about speaker data richness"""
        print(f"\n[{self.enrichment_id}] Generating speaker data statistics...")
        
        if not self.client.collections.exists('Speaker'):
            return {'error': 'Speaker collection does not exist'}
        
        speaker_collection = self.client.collections.get('Speaker')
        
        # Use aggregation to get total count
        count_response = speaker_collection.aggregate.over_all(total_count=True)
        total_speakers = count_response.total_count
        
        # Get sample for detailed analysis
        response = speaker_collection.query.fetch_objects(limit=min(total_speakers, 200))
        
        stats = {
            'total_speakers': total_speakers,
            'analyzed_sample': len(response.objects),
            'data_completeness': {},
            'expertise_distribution': {},
            'affiliation_distribution': {},
            'publication_stats': {},
            'timestamp': datetime.now().isoformat()
        }
        
        # Analyze data completeness
        fields_to_check = ['bio', 'expertise', 'researchFocus', 'keyPublications', 'ctbtoInvolvement', 'contactInfo']
        completeness = {field: 0 for field in fields_to_check}
        
        expertise_areas = {}
        affiliations = {}
        publication_counts = []
        
        for speaker in response.objects:
            props = speaker.properties
            
            # Check field completeness
            for field in fields_to_check:
                if props.get(field) and props[field]:
                    if isinstance(props[field], list):
                        if len(props[field]) > 0:
                            completeness[field] += 1
                    else:
                        completeness[field] += 1
            
            # Analyze expertise distribution
            if props.get('expertise'):
                for area in props['expertise']:
                    expertise_areas[area] = expertise_areas.get(area, 0) + 1
            
            # Analyze affiliations
            if props.get('affiliation'):
                org = props['affiliation'].split(',')[0].strip()  # Get primary organization
                affiliations[org] = affiliations.get(org, 0) + 1
            
            # Publication counts
            if props.get('keyPublications'):
                publication_counts.append(len(props['keyPublications']))
        
        # Calculate percentages
        sample_size = len(response.objects)
        stats['data_completeness'] = {
            field: {
                'count': count,
                'percentage': (count / sample_size) * 100 if sample_size > 0 else 0
            }
            for field, count in completeness.items()
        }
        
        # Top expertise areas
        stats['expertise_distribution'] = dict(sorted(
            expertise_areas.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10])
        
        # Top affiliations
        stats['affiliation_distribution'] = dict(sorted(
            affiliations.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10])
        
        # Publication statistics
        if publication_counts:
            stats['publication_stats'] = {
                'avg_publications': sum(publication_counts) / len(publication_counts),
                'max_publications': max(publication_counts),
                'speakers_with_publications': len(publication_counts)
            }
        
        return stats


def main():
    parser = argparse.ArgumentParser(description='Speaker Data Enrichment')
    parser.add_argument('--enrich', action='store_true', help='Enrich speaker data')
    parser.add_argument('--verify', action='store_true', help='Verify enrichment')
    parser.add_argument('--stats', action='store_true', help='Show detailed statistics')
    
    args = parser.parse_args()
    
    enricher = SpeakerDataEnricher()
    
    try:
        if args.enrich:
            stats = enricher.enrich_speaker_data()
            
        elif args.verify:
            verification = enricher.verify_enrichment()
            
            if 'error' in verification:
                print(f"❌ Verification failed: {verification['error']}")
            else:
                print("✅ Verification completed successfully!")
                
        elif args.stats:
            stats = enricher.get_enrichment_stats()
            
            if 'error' in stats:
                print(f"❌ Stats generation failed: {stats['error']}")
            else:
                print("\n📊 Speaker Data Statistics:")
                print(f"Total speakers: {stats['total_speakers']}")
                
                print("\nData Completeness:")
                for field, data in stats['data_completeness'].items():
                    print(f"  {field}: {data['count']} ({data['percentage']:.1f}%)")
                
                if stats['expertise_distribution']:
                    print("\nTop Expertise Areas:")
                    for area, count in list(stats['expertise_distribution'].items())[:5]:
                        print(f"  {area}: {count} speakers")
                
                if stats['publication_stats']:
                    pubs = stats['publication_stats']
                    print(f"\nPublication Stats:")
                    print(f"  Avg publications per speaker: {pubs['avg_publications']:.1f}")
                    print(f"  Max publications: {pubs['max_publications']}")
                    print(f"  Speakers with publications: {pubs['speakers_with_publications']}")
                
        else:
            print("No action specified. Use --help for options.")
            
    except Exception as e:
        print(f"\n❌ Error during enrichment: {e}")
        raise
    finally:
        enricher.client.close()


if __name__ == "__main__":
    main() 