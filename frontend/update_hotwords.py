import json
import os

def update_persona_hotwords():
    """
    Reads hotwords from a JSON file and updates the persona configuration.
    """
    try:
        # Define paths relative to the script's location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir) # Go up one level from frontend to project root
        hotwords_path = os.path.join(project_root, 'backend', 'backend_data', 'glossaries', 'hotwords.json')
        persona_config_path = os.path.join(script_dir, 'rosa-persona-config.json')

        # Read the hotwords from hotwords.json
        with open(hotwords_path, 'r') as f:
            hotwords_list = json.load(f)

        # Format the hotwords into a single string as expected by the persona
        hotwords_string = ". ".join(hotwords_list)
        if hotwords_list:
            hotwords_string += "."


        # Read the existing persona configuration
        with open(persona_config_path, 'r') as f:
            persona_config = json.load(f)

        # Update the hotwords in the persona configuration
        # It assumes the structure persona_config['layers']['stt']['hotwords'] exists
        if 'layers' in persona_config and 'stt' in persona_config['layers']:
            persona_config['layers']['stt']['hotwords'] = hotwords_string
        else:
            print("Warning: 'layers.stt' path not found in persona config. Hotwords not updated.")
            return

        # Write the updated configuration back to the file
        with open(persona_config_path, 'w') as f:
            json.dump(persona_config, f, indent=2)

        print(f"✅ Successfully updated persona hotwords with {len(hotwords_list)} terms.")

    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure both hotwords.json and rosa-persona-config.json exist.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    update_persona_hotwords() 