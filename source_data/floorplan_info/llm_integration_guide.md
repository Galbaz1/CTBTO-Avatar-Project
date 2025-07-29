# LLM Integration Guide: Navigation System for SnT2025
## How to Use the Conversational Navigation Data

### System Integration Overview

**Data Flow**: User Query → Profile Detection → Navigation Data Lookup → Conversational Response

---

## Quick Reference for LLM Responses

### 🎯 **Core Navigation Facts (MEMORIZE THESE)**
```json
{
  "ground_floor_distances": {
    "entry_to_gardensaal": "8m (15-20 sec)",
    "entry_to_wc": "12m (20-25 sec)", 
    "entry_to_stairs": "15m (25-30 sec)"
  },
  "mezzanine_distances": {
    "stairs_to_festsaal": "20m (35-40 sec)",
    "stairs_to_zeremoniensaal": "15m (25-30 sec)",
    "festsaal_to_zeremoniensaal": "25m (30-45 sec)"
  },
  "key_routes": {
    "ground_to_festsaal": "2-2.5 minutes total",
    "between_mezzanine_rooms": "30-60 seconds",
    "any_room_to_wc": "1-2 minutes max"
  }
}
```

### 🏢 **Room Functions (Match User Intent)**
- **Festsaal**: Main plenaries, keynotes, High-Level Plenary (Sep 9)
- **Zeremoniensaal**: Ceremonies, formal presentations  
- **Gardensaal**: Exhibitions, flexible meetings
- **Ground floor**: WC, registration, cloakroom, entry services

---

## Response Templates by User Type

### Template 1: Expert/Professional
```
For {VENUE}: {DIRECT_ROUTE} - about {TIME_ESTIMATE}. 
{RELEVANT_CONTEXT for their session/meeting}
```

**Example**: *"For Prinz Eugen Saal: head to Gardensaal area, 8m straight from entry, then continue to the theater-style room. About 45 seconds total. Perfect for your O3.1 technical session."*

### Template 2: Casual/Student  
```
{CASUAL_GREETING}! {ROUTE_WITH_LANDMARKS} - super easy, like {TIME_ESTIMATE}!
{HELPFUL_TIP}
```

**Example**: *"Hey! For the YPN booth, just head up those main stairs (Feststiege) and you'll see it right in the upper area. Takes like 1 minute from entrance. Perfect for networking!"*

### Template 3: Stressed/Non-Technical
```
No worries! {SIMPLE_STEP_BY_STEP}. 
Should take about {TIME_ESTIMATE}. {REASSURANCE}
```

**Example**: *"No worries! For restrooms: go back down the main stairs, turn right when you reach ground floor. Just 12 meters away - you'll see clear signs. Takes about 1 minute total. Easy to find!"*

### Template 4: Formal/Diplomatic
```
{VENUE} is located {FORMAL_DESCRIPTION}. 
To access: {PROCEDURAL_STEPS}. 
{PROTOCOL_RELEVANT_INFO}
```

**Example**: *"Festsaal is located on the mezzanine level. To access: proceed 15 meters to the Feststiege, ascend to the upper level, then continue 20 meters to the formal entrance. Capacity 400+ attendees, appropriate for diplomatic proceedings."*

---

## User Intent Detection Triggers

### Navigation Keywords → Response Type
- **"directions", "how to get", "where is"** → Full route with timing
- **"quick", "fast", "nearest"** → Shortest path emphasis  
- **"lost", "confused", "help"** → Reassuring + simple steps
- **"stairs", "elevator", "accessibility"** → Include accessibility options

### User Profile Indicators → Tone Adaptation
- **Technical jargon** (IMS, NDC, O3.1) → Expert level response
- **Casual language** ("yo", "wheres") → Student/informal tone
- **Formal language** ("query", "kindly") → Professional/diplomatic tone
- **Stress indicators** ("quick", "uh") → Reassuring approach

---

## Error Prevention Checklist

### ✅ **Before Responding, Verify**:
1. **Distance accuracy**: Use only the architectural measurements
2. **Floor level**: Ground (Parterre) vs Mezzanine confusion  
3. **Stair requirement**: Any ground→mezzanine needs Feststiege
4. **Room names**: Gardensaal (not "exhibition area"), Festsaal (not "ballroom")
5. **Time estimates**: Realistic for conference walking speeds

### ❌ **Never Say**:
- Vague distances ("across the hall", "nearby")
- Wrong floor levels ("Festsaal is on ground floor")
- Non-existent routes ("elevator to Festsaal")
- Outdated room names from old data

---

## Context Enhancement Rules

### Add Value Based on Query Intent:
- **Session attendees**: Mention room layout, capacity
- **Speakers**: Include setup info, timing considerations  
- **Networking**: Point out social areas, break times
- **First-timers**: Extra landmarks, reassurance
- **Regulars**: Efficient routes, assume familiarity

### Cultural Adaptations:
- **German/Austrian users**: Direct, efficient instructions
- **American users**: Friendly, conversational tone
- **Diplomatic users**: Formal, protocol-aware language
- **Student users**: Encouraging, social context

---

## Sample Integration Code Logic

```python
def generate_navigation_response(user_query, user_profile):
    # 1. Extract destination and current location
    destination = extract_venue(user_query)
    
    # 2. Get accurate route data
    route = ARCHITECTURAL_DATA[destination]
    
    # 3. Match response style to user profile
    if user_profile.technical_level == "expert":
        tone = "direct_professional"
    elif user_profile.age_range == "18-28":
        tone = "casual_friendly" 
    elif "diplomat" in user_profile.affiliation:
        tone = "formal_protocol"
    
    # 4. Generate response using template
    return build_response(route, tone, user_context)
```

---

## Quality Assurance

### Test Every Response Against:
1. **Accuracy**: Route physically possible within conference zone
2. **Clarity**: Non-ambiguous directions  
3. **Timing**: Realistic walk time estimates
4. **Tone**: Matches user communication style
5. **Value**: Includes helpful context for their needs

### Red Flags (Immediate Review Needed):
- Any distance over 30 meters without stairs
- Navigation outside red conference zone  
- Missing time estimates
- Generic responses not matching user profile

---

*This integration guide ensures the LLM delivers accurate, natural navigation assistance that feels human and helpful while maintaining architectural precision.* 