from termcolor import colored
import asyncio
from agents import Agent, Runner, trace


# Global variables
THREAD_ID = "conversation-thread-123"  # Unique identifier for the conversation

try:
    # Define specialist agents
    history_tutor_agent = Agent(
        name="History Tutor",
        handoff_description="Specialist agent for historical questions", 
        instructions="You provide assistance with historical queries. Explain important events and context clearly.",
    )
    print(colored("Created History Tutor Agent", "green"))

    math_tutor_agent = Agent(
        name="Math Tutor",
        handoff_description="Specialist agent for math questions",
        instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
    )
    print(colored("Created Math Tutor Agent", "green"))

    # Define triage agent with handoffs
    triage_agent = Agent(
        name="Triage Agent",
        instructions="You determine which agent to use based on the user's question. Maintain conversation context.",
        handoffs=[history_tutor_agent, math_tutor_agent]
    )
    print(colored("Created Triage Agent with handoffs configured", "green"))

    # Run continuous chat loop
    async def main():
        try:
            print(colored("Starting continuous chat. Type 'exit' to quit.", "cyan"))
            
            # Initialize conversation history
            conversation_history = []
            print(colored("Initialized conversation history", "blue"))
            
            while True:
                try:
                    # Get user input
                    user_input = input(colored("\nYou: ", "yellow"))
                    
                    # Check for exit command
                    if user_input.lower() == 'exit':
                        print(colored("\nGoodbye!", "cyan"))
                        break
                    
                    # Add user message to conversation history
                    if not conversation_history:
                        # First message - just use the text input
                        input_for_agent = user_input
                    else:
                        # Add the new user message to existing conversation
                        conversation_history.append({"role": "user", "content": user_input})
                        input_for_agent = conversation_history
                    
                    # Run agent with conversation history
                    print(colored("\nAgent is thinking...", "cyan"))
                    
                    with trace(workflow_name="Conversation", group_id=THREAD_ID):
                        result = await Runner.run(triage_agent, input_for_agent)
                    
                    # Display the response
                    print(colored("\nAgent: ", "green") + result.final_output)
                    
                    # Update conversation history with agent's response
                    if not conversation_history:
                        # Initialize history with the first exchange
                        conversation_history = result.to_input_list()
                        print(colored("Created initial conversation history", "blue"))
                    else:
                        # Update existing history with agent's response
                        conversation_history.append({"role": "assistant", "content": result.final_output})
                        print(colored("Updated conversation history", "blue"))
                    
                except Exception as e:
                    print(colored(f"\nError during conversation: {str(e)}", "red"))
                    
        except Exception as e:
            print(colored(f"Error in main loop: {str(e)}", "red"))

    # Example of how to maintain conversation history across turns
    async def example_conversation():
        try:
            print(colored("\nRunning example conversation with history:", "cyan"))
            agent = Agent(name="Assistant", instructions="Reply very concisely.")
            
            with trace(workflow_name="Conversation", group_id=THREAD_ID):
                # First turn
                print(colored("\nUser: What city is the Golden Gate Bridge in?", "yellow"))
                result = await Runner.run(agent, "What city is the Golden Gate Bridge in?")
                print(colored("Agent: ", "green") + result.final_output)
                
                # Save conversation history
                conversation_history = result.to_input_list()
                
                # Second turn - pass the history + new question
                print(colored("\nUser: What state is it in?", "yellow"))
                conversation_history.append({"role": "user", "content": "What state is it in?"})
                result = await Runner.run(agent, conversation_history)
                print(colored("Agent: ", "green") + result.final_output)
                
                # Update history for potential future turns
                conversation_history.append({"role": "assistant", "content": result.final_output})
                
        except Exception as e:
            print(colored(f"Error in example conversation: {str(e)}", "red"))

    # Run the async main function
    if __name__ == "__main__":
        try:
            # Uncomment to run the example
            # asyncio.run(example_conversation())
            
            # Run the main chat loop
            asyncio.run(main())
        except Exception as e:
            print(colored(f"Error in main execution: {str(e)}", "red"))

except Exception as e:
    print(colored(f"Error setting up agents: {str(e)}", "red"))
