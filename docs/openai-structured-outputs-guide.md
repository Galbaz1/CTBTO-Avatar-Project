# OpenAI Structured Outputs Guide

> **Source:** https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses  
> **Scraped:** 2025-01-29  
> **Status:** Production (No longer in beta)

## Overview

Structured Outputs is a feature that ensures the model will always generate responses that adhere to your supplied JSON Schema, so you don't need to worry about the model omitting a required key, or hallucinating an invalid enum value.

### Key Benefits
- **Reliable type-safety**: No need to validate or retry incorrectly formatted responses
- **Explicit refusals**: Safety-based model refusals are now programmatically detectable  
- **Simpler prompting**: No need for strongly worded prompts to achieve consistent formatting

## Getting Started

### Basic Example with Pydantic

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ],
    text_format=CalendarEvent,
)
event = response.output_parsed
```

### Supported Models

Structured Outputs is available in:
- **gpt-4o-2024-08-06** and later
- **gpt-4o-mini** models
- Older models like **gpt-4-turbo** may use JSON mode instead

## When to Use Structured Outputs

### Function Calling vs text.format

**Use Function Calling when:**
- Building applications that bridge models and your app's functionality
- Giving models access to functions that query databases
- Building AI assistants that interact with UIs
- Connecting the model to tools, functions, data in your system

**Use text.format when:**
- Structuring the model's output when responding to users
- Building applications like math tutoring with specific display requirements
- You want to indicate a structured schema for user-facing responses

## Structured Outputs vs JSON Mode

| Feature | Structured Outputs | JSON Mode |
|---------|-------------------|-----------|
| **Outputs valid JSON** | ✅ Yes | ✅ Yes |
| **Adheres to schema** | ✅ Yes | ❌ No |
| **Compatible models** | gpt-4o-mini, gpt-4o-2024-08-06+ | gpt-3.5-turbo, gpt-4-*, gpt-4o-* |
| **Enabling** | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }` | `text: { format: { type: "json_object" } }` |

**Recommendation:** Always use Structured Outputs instead of JSON mode when possible.

## Examples

### Chain of Thought Math Tutoring

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

response = client.responses.parse(
    model="gpt-4o-2024-08-06",
    input=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"},
    ],
    text_format=MathReasoning,
)
math_reasoning = response.output_parsed
```

### Example Response Structure

```json
{
  "steps": [
    {
      "explanation": "Start with the equation 8x + 7 = -23.",
      "output": "8x + 7 = -23"
    },
    {
      "explanation": "Subtract 7 from both sides to isolate the term with the variable.",
      "output": "8x = -23 - 7"
    },
    {
      "explanation": "Simplify the right side of the equation.",
      "output": "8x = -30"
    },
    {
      "explanation": "Divide both sides by 8 to solve for x.",
      "output": "x = -30 / 8"
    },
    {
      "explanation": "Simplify the fraction.",
      "output": "x = -15 / 4"
    }
  ],
  "final_answer": "x = -15 / 4"
}
```

## Handling Refusals

When using Structured Outputs with user-generated input, OpenAI models may occasionally refuse to fulfill requests for safety reasons. Handle refusals properly:

```python
class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format=MathReasoning,
)

math_reasoning = completion.choices[0].message

# Handle refusals
if math_reasoning.refusal:
    print(math_reasoning.refusal)
else:
    print(math_reasoning.parsed)
```

## Streaming Support

You can stream structured outputs as they are generated:

```python
from typing import List
from openai import OpenAI
from pydantic import BaseModel

class EntitiesModel(BaseModel):
    attributes: List[str]
    colors: List[str]
    animals: List[str]

client = OpenAI()

with client.responses.stream(
    model="gpt-4.1",
    input=[
        {"role": "system", "content": "Extract entities from the input text"},
        {"role": "user", "content": "The quick brown fox jumps over the lazy dog with piercing blue eyes"},
    ],
    text_format=EntitiesModel,
) as stream:
    for event in stream:
        if event.type == "response.refusal.delta":
            print(event.delta, end="")
        elif event.type == "response.output_text.delta":
            print(event.delta, end="")
        elif event.type == "response.error":
            print(event.error, end="")
        elif event.type == "response.completed":
            print("Completed")

    final_response = stream.get_final_response()
    print(final_response)
```

## Supported JSON Schema Features

### Supported Types
- String
- Number  
- Boolean
- Integer
- Object
- Array
- Enum
- anyOf

### Supported String Properties
- `pattern` — Regular expression the string must match
- `format` — Predefined formats:
  - `date-time`, `time`, `date`, `duration`
  - `email`, `hostname`
  - `ipv4`, `ipv6`, `uuid`

### Supported Number Properties
- `multipleOf`, `maximum`, `exclusiveMaximum`
- `minimum`, `exclusiveMinimum`

### Supported Array Properties
- `minItems`, `maxItems`

### String Restrictions Example

```json
{
  "name": "user_data",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the user"
      },
      "username": {
        "type": "string",
        "description": "The username of the user. Must start with @",
        "pattern": "^@[a-zA-Z0-9_]+$"
      },
      "email": {
        "type": "string",
        "description": "The email of the user",
        "format": "email"
      }
    },
    "additionalProperties": false,
    "required": ["name", "username", "email"]
  }
}
```

## Schema Requirements and Limitations

### Required Fields
- **All fields must be required** — To use Structured Outputs, all fields must be specified as required
- **Root objects must be objects** — Cannot use `anyOf` at the root level
- **additionalProperties: false** — Must always be set in objects

### Size Limitations
- **Object properties**: Up to 5000 total, with up to 5 levels of nesting
- **String length**: Total string length of all property names, definition names, enum values, and const values cannot exceed 120,000 characters
- **Enum values**: Up to 1000 enum values across all enum properties
- **Single enum**: For string enums with 250+ values, total string length cannot exceed 15,000 characters

### Emulating Optional Fields

```json
{
  "name": "get_weather",
  "description": "Fetches the weather in the given location",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The location to get the weather for"
      },
      "unit": {
        "type": ["string", "null"],
        "description": "The unit to return the temperature in",
        "enum": ["F", "C"]
      }
    },
    "additionalProperties": false,
    "required": ["location", "unit"]
  }
}
```

### Unsupported Features

**Not yet supported:**
- Composition: `allOf`, `not`, `dependentRequired`, `dependentSchemas`, `if`, `then`, `else`

**Fine-tuned models additionally don't support:**
- For strings: `minLength`, `maxLength`, `pattern`, `format`
- For numbers: `minimum`, `maximum`, `multipleOf`
- For objects: `patternProperties`
- For arrays: `minItems`, `maxItems`

## Advanced Features

### Definitions Support

```json
{
  "type": "object",
  "properties": {
    "steps": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/step"
      }
    },
    "final_answer": {
      "type": "string"
    }
  },
  "$defs": {
    "step": {
      "type": "object",
      "properties": {
        "explanation": {"type": "string"},
        "output": {"type": "string"}
      },
      "required": ["explanation", "output"],
      "additionalProperties": false
    }
  },
  "required": ["steps", "final_answer"],
  "additionalProperties": false
}
```

### Recursive Schemas

Recursive schemas are supported using `#` for root recursion or explicit references:

```json
{
  "name": "ui",
  "description": "Dynamically generated UI",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "description": "The type of the UI component",
        "enum": ["div", "button", "header", "section", "field", "form"]
      },
      "label": {
        "type": "string",
        "description": "The label of the UI component"
      },
      "children": {
        "type": "array",
        "description": "Nested UI components",
        "items": {
          "$ref": "#"
        }
      }
    },
    "required": ["type", "label", "children"],
    "additionalProperties": false
  }
}
```

## Best Practices

### Handling User-Generated Input
- Include instructions on how to handle situations where input cannot result in valid response
- Specify returning empty parameters or specific sentences for incompatible input
- The model will try to adhere to schema, which can result in hallucinations if input is unrelated

### Handling Mistakes
- Structured Outputs can still contain mistakes
- Try adjusting instructions, providing examples, or splitting into simpler subtasks
- Refer to prompt engineering guide for optimization

### Avoid Schema Divergence
- Use native Pydantic/Zod SDK support to prevent divergence
- Add CI rules to flag when JSON schema or data objects are edited
- Auto-generate JSON Schema from type definitions (or vice-versa)

## JSON Mode (Legacy)

JSON mode is a more basic version of Structured Outputs. While it ensures valid JSON output, it doesn't guarantee schema adherence.

**To enable JSON mode:**
```python
# Set text.format to {"type": "json_object"}
```

**Important notes:**
- Must instruct model to produce JSON via conversation
- Does not guarantee output matches specific schema
- Requires validation and potentially retries
- Must handle edge cases where output might not be complete JSON

## Resources

- [Structured Outputs Cookbook](https://github.com/openai/openai-cookbook)
- [Multi-agent Systems with Structured Outputs](https://platform.openai.com/docs/guides/multi-agent)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)

---

*Documentation scraped from OpenAI Platform on 2025-01-29* 