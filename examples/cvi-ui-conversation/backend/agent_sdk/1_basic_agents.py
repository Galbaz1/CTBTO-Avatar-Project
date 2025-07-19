from termcolor import colored
import asyncio
from agents import Agent, Runner

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
        instructions="You determine which agent to use based on the user's homework question",
        handoffs=[history_tutor_agent, math_tutor_agent]
    )
    print(colored("Created Triage Agent with handoffs configured", "green"))

    # Run the agent orchestration
    async def main():
        try:
            print(colored("Running agent orchestration...", "cyan"))
            result = await Runner.run(triage_agent, "What is the capital of France?")
            print(colored("Final output:", "green"))
            print(result.final_output)
        except Exception as e:
            print(colored(f"Error running agent orchestration: {str(e)}", "red"))

    # Run the async main function
    if __name__ == "__main__":
        try:
            asyncio.run(main())
        except Exception as e:
            print(colored(f"Error in main execution: {str(e)}", "red"))

except Exception as e:
    print(colored(f"Error setting up agents: {str(e)}", "red"))
