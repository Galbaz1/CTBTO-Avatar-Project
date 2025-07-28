# Final, Corrected Weaviate v4 Ingestion Script
# --------------------------------------------------
# This script connects to a Weaviate Cloud instance,
# defines a multi-collection schema for conference data,
# and populates it using a two-phase ingestion process.
#
# Key Features:
# - Weaviate Python Client v4 Syntax
# - Phonetic Correction: Expands abbreviations for Text-to-Speech.
# - Graph Creation: Builds cross-references between collections.
# - Deterministic UUIDs: Prevents data duplication on re-runs.
# - Robust Error Handling: Includes fixes for common ingestion issues.
# --------------------------------------------------

import os
import weaviate
import json
import uuid
from datetime import datetime, timezone
import re
from dotenv import load_dotenv
from weaviate.util import generate_uuid5
import weaviate.classes.config as wvc
import weaviate.classes.data as wvc_data
import weaviate.classes.query as wvc_query

# --- CONFIGURATION ---
def load_config():
    """Loads and validates required environment variables."""
    print("Loading configuration...")
    # Assumes script is in design-patterns/WEAVIATE and .env is in Rosa_custom_backend
    script_dir = os.path.dirname(os.path.realpath(__file__))
    dotenv_path = os.path.join(script_dir, '..', '..', 'Rosa_custom_backend', '.env')
    load_dotenv(dotenv_path=dotenv_path)
    
    config = {
        "WEAVIATE_URL": os.getenv('WEAVIATE_URL'),
        "WEAVIATE_API_KEY": os.getenv('WEAVIATE_API_KEY'),
        "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY'),
        "DATA_PATH": os.path.join(script_dir, '..', '..', 'Rosa_custom_backend', 'backend', 'backend_data')
    }
    
    if not all([config["WEAVIATE_URL"], config["WEAVIATE_API_KEY"], config["OPENAI_API_KEY"]]):
        raise ValueError('Missing one or more required environment variables in .env file')
        
    print("Configuration loaded successfully.")
    return config

# --- DATA PRE-PROCESSING ---
def build_expansion_map(data_path):
    """Builds a map of abbreviations to their full text for TTS optimization."""
    print("Building abbreviation map for phonetic correction...")
    ABBREVIATION_MAP = {
        "dr.": "Doctor",
        "mr.": "Mister", 
        "ms.": "Miss",
        "prof.": "Professor",
        "snt": "Science and Technology",
        "ctbt": "Comprehensive Nuclear-Test-Ban Treaty",
        "ctbto": "Comprehensive Nuclear-Test-Ban Treaty Organization",
        "ims": "International Monitoring System",
        "idc": "International Data Centre",
        "osi": "On-Site Inspection",
        "ndc": "National Data Centre",
    }
    
    glossary_file = os.path.join(data_path, 'glossaries', 'ctbto_glossary.json')
    try:
        with open(glossary_file, 'r', encoding='utf-8') as f:
            glossary_data = json.load(f)
        for item in glossary_data:
            term = item.get('term')
            definition = item.get('definition', '')
            if term and definition:
                # Check for "Acronym for [Full Text]" pattern
                match = re.match(r'Acronym for (.+)\.', definition, re.IGNORECASE)
                if match:
                    full_text = match.group(1).strip()
                    ABBREVIATION_MAP[term.lower()] = full_text
    except FileNotFoundError:
        print('Warning: ctbto_glossary.json not found.')
    return ABBREVIATION_MAP

def expand_abbreviations(text, expansion_map):
    """Expands all known abbreviations in a string."""
    if not isinstance(text, str):
        return text
    
    # Sort keys by length descending to avoid partial matches
    sorted_abbrs = sorted(expansion_map.keys(), key=len, reverse=True)
    
    for abbr in sorted_abbrs:
        # Use regex with word boundaries to replace whole words only
        pattern = r'\b' + re.escape(abbr) + r'\b'
        text = re.sub(pattern, expansion_map[abbr], text, flags=re.IGNORECASE)
    return text

# --- SCHEMA MANAGEMENT ---
def define_and_create_schema(client):
    """Defines and creates all collections using the v4 Python client."""
    print("\n--- Step 1: Defining and Creating Schema ---")
    
    collections_to_manage = [
        'SnT25_Topic', 'SnT25_Speaker', 'SnT25_Room', 'SnT25_Session',
        'SnT25_GlossaryTerm', 'SnT25_RedZoneRule', 'ConferenceChunk', 'ConferenceSession'
    ]
    for name in collections_to_manage:
        if client.collections.exists(name):
            client.collections.delete(name)
            print(f'  - Deleted existing collection: {name}')

    vectorizer_config = wvc.Configure.Vectorizer.text2vec_openai(vectorize_collection_name=False)
    generative_config = wvc.Configure.Generative.openai()

    client.collections.create(
        name='SnT25_Topic',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='topicCode', data_type=wvc.DataType.TEXT, skip_vectorization=True),
            wvc.Property(name='title', data_type=wvc.DataType.TEXT),
            wvc.Property(name='keywords', data_type=wvc.DataType.TEXT),
            wvc.Property(name='themeTitle', data_type=wvc.DataType.TEXT),
            wvc.Property(name='themeDescription', data_type=wvc.DataType.TEXT),
        ]
    )
    print("  - Created SnT25_Topic")
    
    client.collections.create(
        name='SnT25_Speaker',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='name', data_type=wvc.DataType.TEXT, skip_vectorization=True),
            wvc.Property(name='title', data_type=wvc.DataType.TEXT),
            wvc.Property(name='affiliation', data_type=wvc.DataType.TEXT),
            wvc.Property(name='bio', data_type=wvc.DataType.TEXT),
        ]
    )
    print("  - Created SnT25_Speaker")

    client.collections.create(
        name='SnT25_Room',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='name', data_type=wvc.DataType.TEXT, skip_vectorization=True),
            wvc.Property(name='level', data_type=wvc.DataType.TEXT),
            wvc.Property(name='description', data_type=wvc.DataType.TEXT),
        ]
    )
    print("  - Created SnT25_Room")

    client.collections.create(
        name='SnT25_GlossaryTerm',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='term', data_type=wvc.DataType.TEXT, skip_vectorization=True),
            wvc.Property(name='definition', data_type=wvc.DataType.TEXT),
        ]
    )
    print("  - Created SnT25_GlossaryTerm")

    client.collections.create(
        name='SnT25_RedZoneRule',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='category', data_type=wvc.DataType.TEXT),
            wvc.Property(name='topic', data_type=wvc.DataType.TEXT),
            wvc.Property(name='guideline', data_type=wvc.DataType.TEXT),
            wvc.Property(name='source', data_type=wvc.DataType.TEXT),
        ]
    )
    print("  - Created SnT25_RedZoneRule")

    client.collections.create(
        name='SnT25_Session',
        vectorizer_config=vectorizer_config,
        generative_config=generative_config,
        properties=[
            wvc.Property(name='title', data_type=wvc.DataType.TEXT),
            wvc.Property(name='sessionType', data_type=wvc.DataType.TEXT),
            wvc.Property(name='startTime', data_type=wvc.DataType.DATE),
            wvc.Property(name='endTime', data_type=wvc.DataType.DATE),
            wvc.Property(name='day', data_type=wvc.DataType.TEXT),
            wvc.Property(name='abstract', data_type=wvc.DataType.TEXT),
        ],
        references=[
            wvc.ReferenceProperty(name='hasSpeakers', target_collection='SnT25_Speaker'),
            wvc.ReferenceProperty(name='hasTopic', target_collection='SnT25_Topic'),
            wvc.ReferenceProperty(name='inRoom', target_collection='SnT25_Room'),
        ]
    )
    print("  - Created SnT25_Session")
    print("Schema creation complete.")

# --- DATA INGESTION ---
def ingest_data(client, config, expansion_map):
    """Performs the two-phase data ingestion."""
    print("\n--- Step 2: Ingesting and Linking Data ---")
    uuid_cache = {'speakers': {}, 'topics': {}, 'rooms': {}, 'glossary': {}, 'red_zone': {}}
    data_path = config['DATA_PATH']

    # Load all data files
    program_file = os.path.join(data_path, 'event_info', 'snt2025_program.json')
    timetable_file = os.path.join(data_path, 'event_info', 'snt2025_timetable.json')
    room_descriptions_file = os.path.join(data_path, 'floorplan_info', 'snt2025_room_descriptions.json')
    ctbto_glossary_file = os.path.join(data_path, 'glossaries', 'ctbto_glossary.json')
    red_zone_dir = os.path.join(data_path, 'red_zone_json')

    with open(program_file, 'r', encoding='utf-8') as f: program_data = json.load(f)
    with open(timetable_file, 'r', encoding='utf-8') as f: timetable_data = json.load(f)
    with open(room_descriptions_file, 'r', encoding='utf-8') as f: room_descriptions_data = json.load(f)['content']
    with open(ctbto_glossary_file, 'r', encoding='utf-8') as f: ctbto_glossary_data = json.load(f)

    # Phase 1: Ingest Independent Objects and build UUID cache
    print("  - Phase 1: Ingesting independent objects...")
    
    # Ingest Topics
    topics_collection = client.collections.get('SnT25_Topic')
    with topics_collection.batch.dynamic() as batch:
        for theme in program_data['themes']:
            theme_title = expand_abbreviations(theme['title'], expansion_map)
            theme_description = expand_abbreviations(theme['description'], expansion_map)
            for topic in theme['topics']:
                topic_code = expand_abbreviations(topic['code'], expansion_map)
                topic_title = expand_abbreviations(topic['title'], expansion_map)
                keywords = expand_abbreviations(topic['keywords'], expansion_map)
                
                obj_uuid = generate_uuid5(f"topic-{topic_code}")
                uuid_cache['topics'][topic_code.lower()] = obj_uuid
                
                batch.add_object(
                    properties={
                        "topicCode": topic_code,
                        "title": topic_title,
                        "keywords": keywords,
                        "themeTitle": theme_title,
                        "themeDescription": theme_description,
                    },
                    uuid=obj_uuid
                )
    print("    - Topics ingested.")

    # Ingest Rooms
    rooms_collection = client.collections.get('SnT25_Room')
    with rooms_collection.batch.dynamic() as batch:
        key_rooms = {
            "Festsaal": {"level": "Upper Level", "description": "The main presentation room for keynotes and plenary sessions"},
            "Prinz Eugen Saal": {"level": "Ground Floor", "description": "Presentation room for technical sessions"},
            "Forum": {"level": "Ground Floor", "description": "Presentation room for technical sessions"},
            "Wintergarten": {"level": "Upper Level", "description": "Meeting and presentation space"},
            "Zeremoniensaal": {"level": "Upper Level", "description": "Contains the e-poster area and exhibition space"},
            "Hofburg Palace": {"level": "Venue", "description": "Historic venue hosting the SnT2025 conference"},
            "Online Room 1": {"level": "Online", "description": "Virtual room for online sessions"},
            "Online Room 2": {"level": "Online", "description": "Virtual room for online sessions"},
        }

        for room_name, details in key_rooms.items():
            obj_uuid = generate_uuid5(f"room-{room_name}")
            uuid_cache['rooms'][room_name.lower()] = obj_uuid
            
            batch.add_object(
                properties={
                    "name": expand_abbreviations(room_name, expansion_map),
                    "level": expand_abbreviations(details["level"], expansion_map),
                    "description": expand_abbreviations(details["description"], expansion_map),
                },
                uuid=obj_uuid
            )
    print("    - Rooms ingested.")

    # Ingest Speakers
    speakers_collection = client.collections.get('SnT25_Speaker')
    unique_speakers = {}
    for day_data in timetable_data:
        for event in day_data['events']:
            if 'speakers' in event and event['speakers']:
                for speaker_full_name in event['speakers']:
                    # Basic parsing for title and name
                    title_match = re.match(r'(Mr|Ms|Dr|Prof)\s*\.?\s*(.*)', speaker_full_name, re.IGNORECASE)
                    if title_match:
                        title = expand_abbreviations(title_match.group(1).strip(), expansion_map)
                        name = expand_abbreviations(title_match.group(2).strip(), expansion_map)
                    else:
                        title = None
                        name = expand_abbreviations(speaker_full_name.strip(), expansion_map)
                    
                    if name and name.lower() not in unique_speakers:
                        unique_speakers[name.lower()] = {
                            "name": name,
                            "title": title
                        }
    
    with speakers_collection.batch.dynamic() as batch:
        for speaker_data in unique_speakers.values():
            obj_uuid = generate_uuid5(f"speaker-{speaker_data['name']}")
            uuid_cache['speakers'][speaker_data['name'].lower()] = obj_uuid
            
            batch.add_object(
                properties={
                    "name": speaker_data['name'],
                    "title": speaker_data['title'],
                    "affiliation": None,
                    "bio": None,
                },
                uuid=obj_uuid
            )
    print("    - Speakers ingested.")

    # Ingest Glossary Terms
    glossary_collection = client.collections.get('SnT25_GlossaryTerm')
    with glossary_collection.batch.dynamic() as batch:
        for entry in ctbto_glossary_data:
            term = expand_abbreviations(entry.get('term'), expansion_map)
            definition = expand_abbreviations(entry.get('definition'), expansion_map)
            
            obj_uuid = generate_uuid5(f"glossary-{term}")
            uuid_cache['glossary'][term.lower()] = obj_uuid
            
            batch.add_object(
                properties={
                    "term": term,
                    "definition": definition,
                },
                uuid=obj_uuid
            )
    print("    - Glossary ingested.")

    # Ingest Red Zone Rules
    red_zone_collection = client.collections.get('SnT25_RedZoneRule')
    with red_zone_collection.batch.dynamic() as batch:
        for filename in os.listdir(red_zone_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(red_zone_dir, filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    rules_data = json.load(f)
                
                for rule in rules_data:
                    # Handle BOM character if present
                    category_key = next((k for k in rule if k.strip().lower() == 'category'), 'Category')
                    topic_key = next((k for k in rule if k.strip().lower() == 'red zone topic'), 'Red Zone Topic')
                    guideline_key = next((k for k in rule if k.strip().lower() == 'description'), 'Description')

                    category = expand_abbreviations(rule.get(category_key), expansion_map)
                    topic = expand_abbreviations(rule.get(topic_key), expansion_map)
                    guideline = expand_abbreviations(rule.get(guideline_key), expansion_map)
                    
                    obj_uuid = generate_uuid5(f"redzone-{filename}-{guideline}")
                    uuid_cache['red_zone'][guideline.lower()] = obj_uuid
                    
                    batch.add_object(
                        properties={
                            "category": category,
                            "topic": topic,
                            "guideline": guideline,
                            "source": filename,
                        },
                        uuid=obj_uuid
                    )
    print("    - Red Zone Rules ingested.")

    # Phase 2: Ingest Session objects and create links
    print("  - Phase 2: Ingesting and linking sessions...")
    sessions_collection = client.collections.get('SnT25_Session')

    with sessions_collection.batch.dynamic() as batch:
        for day_data in timetable_data:
            day = expand_abbreviations(day_data['day'], expansion_map)
            for event in day_data['events']:
                title = expand_abbreviations(event['title'], expansion_map)
                session_type = expand_abbreviations(event['type'], expansion_map)
                location = event.get('location')

                # Time parsing
                start_time_str, end_time_str = event['time'].split(' - ')
                try:
                    # Parse day string like "Mon 08/09"
                    day_part = day.split(' ')[1]  # "08/09"
                    month_day = datetime.strptime(day_part, '%d/%m').replace(year=2025)
                    
                    start_time = datetime.strptime(start_time_str, '%H:%M').replace(
                        year=month_day.year, month=month_day.month, day=month_day.day,
                        tzinfo=timezone.utc
                    )
                    end_time = datetime.strptime(end_time_str, '%H:%M').replace(
                        year=month_day.year, month=month_day.month, day=month_day.day,
                        tzinfo=timezone.utc
                    )
                except ValueError as e:
                    print(f"  - WARNING: Could not parse time for event '{title}': {e}. Skipping this event.")
                    continue

                # Prepare speaker references
                speaker_refs = []
                if 'speakers' in event and event['speakers']:
                    for speaker_full_name in event['speakers']:
                        # Re-parse name to ensure consistency with cached keys
                        name_match = re.match(r'(Mr|Ms|Dr|Prof)\s*\.?\s*(.*)', speaker_full_name, re.IGNORECASE)
                        name = name_match.group(2).strip() if name_match else speaker_full_name.strip()
                        name = expand_abbreviations(name, expansion_map)
                        
                        speaker_uuid = uuid_cache['speakers'].get(name.lower())
                        if speaker_uuid:
                            speaker_refs.append(wvc_data.DataReference(beacon=speaker_uuid))

                # Prepare topic reference
                topic_ref = None
                topic_code_match = re.search(r'\((T|O)\d+\.\d+(-\d+)?\)', title, re.IGNORECASE)
                if topic_code_match:
                    extracted_code = topic_code_match.group(0).strip('() ').split('-')[0]
                    if extracted_code.startswith('O'):
                        extracted_code = 'T' + extracted_code[1:]
                    
                    topic_uuid = uuid_cache['topics'].get(extracted_code.lower())
                    if topic_uuid:
                        topic_ref = wvc_data.DataReference(beacon=topic_uuid)

                # Prepare room reference
                room_ref = None
                if location:
                    found_room_name = None
                    for r_name_lower, r_uuid in uuid_cache['rooms'].items():
                        if r_name_lower in location.lower():
                            found_room_name = r_name_lower
                            break
                    
                    if found_room_name:
                        room_ref = wvc_data.DataReference(beacon=uuid_cache['rooms'][found_room_name])

                session_uuid = generate_uuid5(f"session-{title}-{start_time.isoformat()}")
                
                properties = {
                    "title": title,
                    "sessionType": session_type,
                    "startTime": start_time,
                    "endTime": end_time,
                    "day": day,
                    "abstract": expand_abbreviations(event.get('abstract', ''), expansion_map)
                }

                references = {}
                if speaker_refs:
                    references["hasSpeakers"] = speaker_refs
                if topic_ref:
                    references["hasTopic"] = topic_ref
                if room_ref:
                    references["inRoom"] = room_ref

                batch.add_object(
                    properties=properties,
                    uuid=session_uuid,
                    references=references if references else None
                )
    print("    - Sessions ingested and linked.")
    print("--- Data population complete! ---")

# --- VERIFICATION ---
def verify_data(client):
    """Runs final checks to verify data integrity and relationships."""
    print("\n--- Step 3: Verifying Data ---")
    
    # Verify counts
    topics_count = client.collections.get("SnT25_Topic").aggregate.over_all(total_count=True).total_count
    sessions_count = client.collections.get("SnT25_Session").aggregate.over_all(total_count=True).total_count
    speakers_count = client.collections.get("SnT25_Speaker").aggregate.over_all(total_count=True).total_count
    rooms_count = client.collections.get("SnT25_Room").aggregate.over_all(total_count=True).total_count
    glossary_count = client.collections.get("SnT25_GlossaryTerm").aggregate.over_all(total_count=True).total_count
    red_zone_count = client.collections.get("SnT25_RedZoneRule").aggregate.over_all(total_count=True).total_count

    print(f'Total topics in Weaviate: {topics_count}')
    print(f'Total sessions in Weaviate: {sessions_count}')
    print(f'Total speakers in Weaviate: {speakers_count}')
    print(f'Total rooms in Weaviate: {rooms_count}')
    print(f'Total glossary terms in Weaviate: {glossary_count}')
    print(f'Total red zone rules in Weaviate: {red_zone_count}')

    # Verify a specific session's links
    print("\nVerification for a sample session:")
    sessions_collection = client.collections.get("SnT25_Session")
    
    response = sessions_collection.query.fetch_objects(
        where=wvc_query.Filter.by_property("title").like("*O3.1*"),
        limit=1,
        return_references=[
            wvc_query.QueryReference(link_on="hasSpeakers", return_properties=["name"]),
            wvc_query.QueryReference(link_on="hasTopic", return_properties=["title"]),
            wvc_query.QueryReference(link_on="inRoom", return_properties=["name"]),
        ]
    )

    if response.objects:
        session_obj = response.objects[0]
        print(f"  -> SUCCESS: Found session '{session_obj.properties['title']}'.")
        
        if hasattr(session_obj, 'references') and session_obj.references:
            if 'hasSpeakers' in session_obj.references:
                speaker_count = len(session_obj.references['hasSpeakers'].objects)
                print(f"  -> SUCCESS: Linked to {speaker_count} Speakers.")
            
            if 'hasTopic' in session_obj.references:
                topic_title = session_obj.references['hasTopic'].objects[0].properties['title']
                print(f"  -> SUCCESS: Linked to Topic: {topic_title}")
                
            if 'inRoom' in session_obj.references:
                room_name = session_obj.references['inRoom'].objects[0].properties['name']
                print(f"  -> SUCCESS: Linked to Room: {room_name}")
    else:
        print("  - No sessions found for verification.")
        
    print("Verification complete.")

# --- MAIN EXECUTION ---
def main():
    """Main function to run the Weaviate ingestion process."""
    try:
        config = load_config()
        expansion_map = build_expansion_map(config['DATA_PATH'])
        
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=config['WEAVIATE_URL'],
            auth_credentials=wvc.init.Auth.api_key(config['WEAVIATE_API_KEY']),
            headers={'X-OpenAI-Api-Key': config['OPENAI_API_KEY']}
        )
        
        print('Successfully connected to Weaviate Cloud.')
        define_and_create_schema(client)
        ingest_data(client, config, expansion_map)
        verify_data(client)
        
        client.close()
        print("\nScript completed successfully!")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Script failed.")

if __name__ == "__main__":
    main()
