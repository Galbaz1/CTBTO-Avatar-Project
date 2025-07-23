from agents import Agent, FileSearchTool, Runner, WebSearchTool, ItemHelpers
import asyncio
from termcolor import colored


agent = Agent(
    name="Assistant",
    tools=[
        WebSearchTool(),
        # FileSearchTool(
        #     max_num_results=3,
        #     vector_store_ids=["VECTOR_STORE_ID"],
        # ),
    ],
)

async def main():
    try:
        print(colored("Starting agent run with event streaming...", "cyan"))
        
        result = Runner.run_streamed(
            agent, 
            "Which coffee shop should I go to, I am in SF, perform web search for coffee shops in SF"
        )
        
        print(colored("=== Run starting ===", "green"))
        
        async for event in result.stream_events():
            # Ignore the raw responses event deltas
            if event.type == "raw_response_event":
                continue
            # When the agent updates, print that
            elif event.type == "agent_updated_stream_event":
                print(colored(f"Agent updated: {event.new_agent.name}", "yellow"))
                continue
            # When items are generated, print them
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    print(colored("-- Tool was called", "magenta"))
                elif event.item.type == "tool_call_output_item":
                    print(colored(f"-- Tool output: {event.item.output}", "blue"))
                elif event.item.type == "message_output_item":
                    print(colored(f"-- Message output:\n {ItemHelpers.text_message_output(event.item)}", "green"))
                else:
                    pass  # Ignore other event types
        
        print(colored("=== Run complete ===", "green"))
        print(colored("Final output:", "cyan"))
        print(result.final_output)
        
    except Exception as e:
        print(colored(f"Error occurred: {str(e)}", "red"))
        print(colored(f"Error details: {type(e).__name__}", "red"))

if __name__ == "__main__":
    asyncio.run(main())