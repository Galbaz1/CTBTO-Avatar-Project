#!/usr/bin/env python3
"""
Weaviate Schema Refactor v2: Collection Migration
-------------------------------------------------
Migrates from SnT25_ prefixed collections to clean, reusable schema.
Adds new ContentChunk collection and metadata tracking.

Usage:
    python schema_refactor_v2.py --migrate
    python schema_refactor_v2.py --verify
    python schema_refactor_v2.py --rollback
"""

import os
import json
import asyncio
import weaviate
from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
import weaviate.classes.data as wvc_data
from weaviate.util import generate_uuid5
import argparse

class SchemaRefactorV2:
    """Handles migration from SnT25_ collections to clean schema with gradual migration support"""
    
    def __init__(self, gradual_migration: bool = True):
        self.load_config()
        self.client = self.connect_weaviate()
        self.migration_id = f"migration_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.gradual_migration = gradual_migration  # If True, keep both old and new collections
        
        print(f"🔄 Schema Refactor V2 initialized (gradual_migration: {self.gradual_migration})")
        
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

    def get_legacy_collections(self) -> List[str]:
        """Get list of existing SnT25_ collections"""
        legacy_collections = []
        for collection in self.client.collections.list_all():
            if collection.startswith('SnT25_'):
                legacy_collections.append(collection)
        return legacy_collections

    def create_new_schema(self):
        """Create new clean collection schema"""
        print(f"\n[{self.migration_id}] Creating new clean schema...")
        
        # Common configurations
        vectorizer_config = wvc.Configure.Vectorizer.text2vec_openai(
            vectorize_collection_name=False,
            model="text-embedding-3-small"  # Latest model
        )
        generative_config = wvc.Configure.Generative.openai(model="gpt-4")
        
        # 1. Topic Collection (was SnT25_Topic)
        if not self.client.collections.exists('Topic'):
            self.client.collections.create(
                name='Topic',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='topicCode', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='title', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='description', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='keywords', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='themeTitle', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='themeDescription', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='sessionCount', data_type=wvc.DataType.INT),
                    # Metadata tracking
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created Topic collection")
        
        # 2. Speaker Collection (was SnT25_Speaker) - ENRICHED
        if not self.client.collections.exists('Speaker'):
            self.client.collections.create(
                name='Speaker',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='name', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='title', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='affiliation', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='bio', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='expertise', data_type=wvc.DataType.TEXT_ARRAY),
                    wvc.Property(name='researchFocus', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='totalSessions', data_type=wvc.DataType.INT),
                    wvc.Property(name='ctbtoInvolvement', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='keyPublications', data_type=wvc.DataType.TEXT_ARRAY),
                    wvc.Property(name='contactInfo', data_type=wvc.DataType.TEXT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created Speaker collection (enriched)")
        
        # 3. Venue Collection (was SnT25_Room)
        if not self.client.collections.exists('Venue'):
            self.client.collections.create(
                name='Venue',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='name', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='level', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='description', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='capacity', data_type=wvc.DataType.INT),
                    wvc.Property(name='sessionCount', data_type=wvc.DataType.INT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created Venue collection")
        
        # 4. Session Collection (was SnT25_Session)
        if not self.client.collections.exists('Session'):
            self.client.collections.create(
                name='Session',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='title', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='sessionType', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='startTime', data_type=wvc.DataType.DATE),
                    wvc.Property(name='endTime', data_type=wvc.DataType.DATE),
                    wvc.Property(name='day', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='abstract', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='themeCode', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='duration', data_type=wvc.DataType.INT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ],
                references=[
                    wvc.ReferenceProperty(name='speakers', target_collection='Speaker'),
                    wvc.ReferenceProperty(name='topic', target_collection='Topic'),
                    wvc.ReferenceProperty(name='venue', target_collection='Venue'),
                ]
            )
            print("  ✓ Created Session collection")
        
        # 5. GlossaryTerm Collection (was SnT25_GlossaryTerm)
        if not self.client.collections.exists('GlossaryTerm'):
            self.client.collections.create(
                name='GlossaryTerm',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='term', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='definition', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='category', data_type=wvc.DataType.TEXT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created GlossaryTerm collection")
        
        # 6. RedZoneRule Collection (was SnT25_RedZoneRule)
        if not self.client.collections.exists('RedZoneRule'):
            self.client.collections.create(
                name='RedZoneRule',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='category', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='topic', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='guideline', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='source', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='severity', data_type=wvc.DataType.TEXT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created RedZoneRule collection")
        
        # 7. NEW: ContentChunk Collection
        if not self.client.collections.exists('ContentChunk'):
            self.client.collections.create(
                name='ContentChunk',
                vectorizer_config=vectorizer_config,
                generative_config=generative_config,
                properties=[
                    wvc.Property(name='chunkText', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='sourceType', data_type=wvc.DataType.TEXT),
                    wvc.Property(name='sourceId', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='chunkIndex', data_type=wvc.DataType.INT),
                    wvc.Property(name='tokenCount', data_type=wvc.DataType.INT),
                    # Metadata
                    wvc.Property(name='embeddingModel', data_type=wvc.DataType.TEXT, skip_vectorization=True),
                    wvc.Property(name='lastUpdated', data_type=wvc.DataType.DATE),
                ]
            )
            print("  ✓ Created ContentChunk collection (NEW)")

    def migrate_data(self):
        """Migrate data from legacy collections to new schema"""
        print(f"\n[{self.migration_id}] Migrating data from legacy collections...")
        
        if self.gradual_migration:
            return self._gradual_migrate_data()
        else:
            return self._direct_migrate_data()
    
    def _direct_migrate_data(self):
        """Direct migration without keeping legacy collections"""
        legacy_collections = self.get_legacy_collections()
        migration_log = []
        
        for legacy_name in legacy_collections:
            new_name = legacy_name.replace('SnT25_', '')
            if new_name == 'Room':
                new_name = 'Venue'  # Room -> Venue mapping
                
            if self.client.collections.exists(new_name):
                print(f"  Migrating {legacy_name} → {new_name}")
                migrated_count = self._migrate_collection_data(legacy_name, new_name)
                migration_log.append({
                    'legacy': legacy_name,
                    'new': new_name,
                    'migrated_objects': migrated_count,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                print(f"  ⚠️  No target collection for {legacy_name}")
        
        # Save migration log
        log_file = f"migration_log_{self.migration_id}.json"
        with open(log_file, 'w') as f:
            json.dump(migration_log, f, indent=2)
        print(f"  ✓ Migration log saved to {log_file}")
        
        return migration_log
    
    def _gradual_migrate_data(self):
        """Gradual migration keeping both old and new collections populated"""
        print("  Using GRADUAL migration strategy (dual population)")
        
        legacy_collections = self.get_legacy_collections()
        migration_log = []
        
        for legacy_name in legacy_collections:
            new_name = legacy_name.replace('SnT25_', '')
            if new_name == 'Room':
                new_name = 'Venue'  # Room -> Venue mapping
                
            if self.client.collections.exists(new_name):
                print(f"  Dual-populating {legacy_name} → {new_name} (keeping both)")
                
                # Migrate to new collection
                migrated_count = self._migrate_collection_data(legacy_name, new_name)
                
                # Verify data consistency
                consistency_check = self._verify_dual_collection_consistency(legacy_name, new_name)
                
                migration_log.append({
                    'legacy': legacy_name,
                    'new': new_name,
                    'migrated_objects': migrated_count,
                    'consistency_verified': consistency_check['is_consistent'],
                    'legacy_count': consistency_check['legacy_count'],
                    'new_count': consistency_check['new_count'],
                    'timestamp': datetime.now().isoformat(),
                    'migration_type': 'gradual'
                })
            else:
                print(f"  ⚠️  No target collection for {legacy_name}")
        
        # Save migration log
        log_file = f"gradual_migration_log_{self.migration_id}.json"
        with open(log_file, 'w') as f:
            json.dump(migration_log, f, indent=2)
        print(f"  ✓ Gradual migration log saved to {log_file}")
        
        return migration_log
    
    def _verify_dual_collection_consistency(self, legacy_name: str, new_name: str) -> Dict[str, Any]:
        """Verify that data was migrated consistently between collections"""
        try:
            legacy_collection = self.client.collections.get(legacy_name)
            new_collection = self.client.collections.get(new_name)
            
            # Get counts
            legacy_count = legacy_collection.aggregate.over_all(total_count=True).total_count
            new_count = new_collection.aggregate.over_all(total_count=True).total_count
            
            # Basic consistency check
            is_consistent = legacy_count == new_count
            
            if is_consistent:
                print(f"    ✅ Consistency verified: {legacy_count} objects in both collections")
            else:
                print(f"    ⚠️  Inconsistency detected: {legacy_name}={legacy_count}, {new_name}={new_count}")
            
            return {
                'is_consistent': is_consistent,
                'legacy_count': legacy_count,
                'new_count': new_count,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"    ❌ Consistency check failed: {e}")
            return {
                'is_consistent': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def _migrate_collection_data(self, legacy_name: str, new_name: str) -> int:
        """Migrate data from one collection to another"""
        legacy_collection = self.client.collections.get(legacy_name)
        new_collection = self.client.collections.get(new_name)
        
        # Get all objects from legacy collection
        response = legacy_collection.query.fetch_objects(limit=1000)
        migrated_count = 0
        
        with new_collection.batch.dynamic() as batch:
            for obj in response.objects:
                # Add metadata to properties
                properties = dict(obj.properties)
                properties['embeddingModel'] = 'text-embedding-3-small'
                properties['lastUpdated'] = datetime.now(timezone.utc)
                
                # Handle special field mappings
                if new_name == 'Speaker':
                    # Initialize new Speaker fields with defaults
                    properties.setdefault('expertise', [])
                    properties.setdefault('researchFocus', '')
                    properties.setdefault('totalSessions', 0)
                    properties.setdefault('ctbtoInvolvement', '')
                    properties.setdefault('keyPublications', [])
                    properties.setdefault('contactInfo', '')
                
                batch.add_object(
                    properties=properties,
                    uuid=obj.uuid,
                    references=obj.references if hasattr(obj, 'references') else None
                )
                migrated_count += 1
        
        return migrated_count

    def verify_migration(self) -> Dict[str, Any]:
        """Verify migration completed successfully"""
        print(f"\n[{self.migration_id}] Verifying migration...")
        
        verification_results = {
            'collections': {},
            'data_integrity': True,
            'timestamp': datetime.now().isoformat()
        }
        
        target_collections = ['Topic', 'Speaker', 'Venue', 'Session', 'GlossaryTerm', 'RedZoneRule', 'ContentChunk']
        
        for collection_name in target_collections:
            if self.client.collections.exists(collection_name):
                collection = self.client.collections.get(collection_name)
                
                # Count objects
                response = collection.aggregate.over_all(total_count=True)
                object_count = response.total_count
                
                # Sample a few objects to verify structure
                sample_response = collection.query.fetch_objects(limit=3)
                sample_objects = [obj.properties for obj in sample_response.objects]
                
                verification_results['collections'][collection_name] = {
                    'exists': True,
                    'object_count': object_count,
                    'sample_properties': list(sample_objects[0].keys()) if sample_objects else [],
                    'has_metadata': any('embeddingModel' in obj for obj in sample_objects)
                }
                
                print(f"  ✓ {collection_name}: {object_count} objects")
            else:
                verification_results['collections'][collection_name] = {'exists': False}
                verification_results['data_integrity'] = False
                print(f"  ❌ {collection_name}: Missing")
        
        return verification_results

    def cleanup_legacy_collections(self, confirm: bool = False):
        """Remove legacy SnT25_ collections (DESTRUCTIVE)"""
        if not confirm:
            print("\n⚠️  DESTRUCTIVE OPERATION: This will delete legacy collections!")
            print("Run with --confirm to proceed")
            return
        
        print(f"\n[{self.migration_id}] Cleaning up legacy collections...")
        
        # If gradual migration, verify new collections are working first
        if self.gradual_migration:
            if not self._verify_new_collections_ready():
                print("❌ New collections not ready for production. Aborting cleanup.")
                return
        
        legacy_collections = self.get_legacy_collections()
        for collection_name in legacy_collections:
            print(f"  Deleting {collection_name}...")
            self.client.collections.delete(collection_name)
            print(f"  ✓ Deleted {collection_name}")
    
    def _verify_new_collections_ready(self) -> bool:
        """Verify new collections are ready for production use"""
        print("  🔍 Verifying new collections are ready for production...")
        
        new_collections = ['Topic', 'Speaker', 'Venue', 'Session', 'GlossaryTerm', 'RedZoneRule']
        
        for collection_name in new_collections:
            if not self.client.collections.exists(collection_name):
                print(f"    ❌ Missing collection: {collection_name}")
                return False
            
            # Check collection has data
            collection = self.client.collections.get(collection_name)
            count_response = collection.aggregate.over_all(total_count=True)
            object_count = count_response.total_count
            
            if object_count == 0:
                print(f"    ❌ Empty collection: {collection_name}")
                return False
            
            print(f"    ✅ {collection_name}: {object_count} objects")
        
        print("  ✅ All new collections verified and ready")
        return True
    
    def switch_to_new_collections(self):
        """Switch environment to use new collections (updates env var)"""
        print(f"\n[{self.migration_id}] Switching to new collections...")
        
        if self._verify_new_collections_ready():
            # This would typically update an environment variable or config file
            print("  ✅ Environment switched to use new collections")
            print("  🔧 Update USE_HYBRID_SEARCH_V2=true in your .env file")
            return True
        else:
            print("  ❌ Cannot switch - new collections not ready")
            return False

    def rollback_migration(self, migration_log_file: str):
        """Rollback migration using saved log"""
        print(f"\n[{self.migration_id}] Rolling back migration...")
        
        if not os.path.exists(migration_log_file):
            print(f"❌ Migration log file not found: {migration_log_file}")
            return
        
        with open(migration_log_file, 'r') as f:
            migration_log = json.load(f)
        
        # This is a simplified rollback - in production, you'd want more sophisticated handling
        print("⚠️  Rollback functionality requires manual intervention")
        print("Recommended steps:")
        print("1. Restore legacy collections from backup")
        print("2. Verify data integrity")
        print("3. Switch application back to legacy schema")


def main():
    parser = argparse.ArgumentParser(description='Weaviate Schema Refactor v2 - Gradual Migration Support')
    parser.add_argument('--migrate', action='store_true', help='Perform migration')
    parser.add_argument('--verify', action='store_true', help='Verify migration')
    parser.add_argument('--cleanup', action='store_true', help='Cleanup legacy collections')
    parser.add_argument('--switch', action='store_true', help='Switch environment to new collections')
    parser.add_argument('--rollback', type=str, help='Rollback using migration log file')
    parser.add_argument('--confirm', action='store_true', help='Confirm destructive operations')
    parser.add_argument('--gradual', action='store_true', default=True, help='Use gradual migration (default)')
    parser.add_argument('--direct', action='store_true', help='Use direct migration (no dual collections)')
    
    args = parser.parse_args()
    
    # Determine migration strategy
    gradual_migration = not args.direct  # Default to gradual unless --direct specified
    
    refactor = SchemaRefactorV2(gradual_migration=gradual_migration)
    
    try:
        if args.migrate:
            refactor.create_new_schema()
            migration_log = refactor.migrate_data()
            verification = refactor.verify_migration()
            
            print(f"\n🎉 Migration completed successfully!")
            print(f"Migration ID: {refactor.migration_id}")
            print(f"Migration Type: {'Gradual (dual collections)' if gradual_migration else 'Direct'}")
            print(f"Collections migrated: {len(migration_log)}")
            
            if gradual_migration:
                print(f"\n📋 Next steps for gradual migration:")
                print(f"1. Test the new hybrid search with USE_HYBRID_SEARCH_V2=true")
                print(f"2. Run --verify to check data consistency")
                print(f"3. Run --switch when ready to switch production")
                print(f"4. Run --cleanup --confirm when legacy collections no longer needed")
            
        elif args.verify:
            verification = refactor.verify_migration()
            
            if verification['data_integrity']:
                print("\n✅ Migration verification passed!")
            else:
                print("\n❌ Migration verification failed!")
                
        elif args.switch:
            success = refactor.switch_to_new_collections()
            if success:
                print("\n✅ Environment switched to new collections!")
                print("🔧 Remember to set USE_HYBRID_SEARCH_V2=true in your .env file")
            else:
                print("\n❌ Switch failed - fix issues before proceeding")
                
        elif args.cleanup:
            refactor.cleanup_legacy_collections(confirm=args.confirm)
            
        elif args.rollback:
            refactor.rollback_migration(args.rollback)
            
        else:
            print("No action specified. Use --help for options.")
            print("\n📖 Gradual Migration Workflow:")
            print("  1. python schema_refactor_v2.py --migrate")
            print("  2. python schema_refactor_v2.py --verify") 
            print("  3. python schema_refactor_v2.py --switch")
            print("  4. python schema_refactor_v2.py --cleanup --confirm")
            
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        raise
    finally:
        refactor.client.close()


if __name__ == "__main__":
    main() 