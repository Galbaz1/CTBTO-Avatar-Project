import asyncio
from pydantic import BaseModel
from agents import Agent, Runner


class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text",
    output_type=CalendarEvent,
)

async def main():
    result = await Runner.run(agent, "I have a meeting with John, emily and james on 2025-03-15 at 10:00 AM")
    print(result.final_output)
    print(result.final_output.participants)

if __name__ == "__main__":
    asyncio.run(main())

