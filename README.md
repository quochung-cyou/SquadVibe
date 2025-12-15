SQUADVIBE – Dress the Vibe, Before You Arrive
---------------------------------------------
[![SquadVibe](https://markdown-videos-api.jorgenkh.no/url?url=https%3A%2F%2Fyoutu.be%2FrZfC4cLpWFI)](https://youtu.be/rZfC4cLpWFI)
<img width="1080" height="608" alt="image" src="https://github.com/user-attachments/assets/4ad09d1c-a818-4157-8ffe-7c232c12c666" />
<img width="1080" height="608" alt="image" src="https://github.com/user-attachments/assets/d4e1d4d3-dc1e-4e85-b73f-c5f3ecd0fc58" />
<img width="1080" height="608" alt="image" src="https://github.com/user-attachments/assets/d70098d1-b420-4ea1-a0e4-f50c42a7e627" />
<img width="1080" height="608" alt="image" src="https://github.com/user-attachments/assets/a3ed7492-a188-4659-a3aa-ac65bdb0e753" />
<img width="1080" height="608" alt="image" src="https://github.com/user-attachments/assets/c41d1f12-df4c-4493-82cf-d7dc3b5ff6ea" />


SQUADVIBE is an AI-native “vibe pre-visualizer” for real life. It turns the chaos of group planning “Where do we go?”, “What do we wear?”, “Will this place actually feel like the photos?”, into one decisive artifact: a photorealistic image of your **real squad**, in your **real outfits**, standing in a **real location** you can visit tomorrow.

Where existing tools stop at ratings, maps or generic outfit inspiration, SQUADVIBE goes one step further: it lets people _see themselves_ inhabiting the future moment before it happens. It’s like storyboarding a scene from your life, not as a fantasy painting, but as a grounded, plausible photograph.

Under the hood, the experience is only possible because of the latest Gemini stack, especially Gemini 3 Pro Image (“Nano Banana Pro”) with strong character consistency and native multimodality. But for users, SQUADVIBE feels effortless: upload photos, search a vibe, pick outfits, and let Gemini “weave reality” into a single, cinematic group shot.

The Human Problem: Social Planning Is Emotional, Not Just Logistical
--------------------------------------------------------------------

Modern social life runs on group chats, and group chats are noisy. Behind every meetup or trip, there is a familiar pattern:

*   One friend shares a café or rooftop bar they saw on Instagram.
    
*   Others worry silently: _“Is it actually like that?”_
    
*   Questions pile up: _Will my outfit fit the vibe? Will everyone else dress similarly? Is this place cozy, loud, pretentious?_
    
*   On the day, people show up misaligned—overdressed, underdressed, or just uncomfortable. The photos captured don’t match the mental picture they had.
    

Most digital tools solve logistics (maps, bookings, reviews), but **not the emotional friction**:“How will _we_ feel there?”“How will _we_ look there, together?”

Simultaneously, outfits are a huge part of self-expression. Yet current virtual try-on experiences are:

*   Single-person focused.
    
*   Often detached from real locations.
    
*   Still feel like “filters” rather than a preview of a real future moment.
    

SQUADVIBE is designed around that missing link: the **squad-level** view of **people + outfits + real-world context** in one frame. It aims to give groups confidence, alignment, and excitement before they ever leave home.

The Core Idea: Vibe-First Planning for Real Places
--------------------------------------------------

SQUADVIBE asks a different question from most map or fashion tools. It doesn’t just ask “Where do you want to go?” or “What clothes do you own?”. Instead, it centers the concept of **vibe**:

> “What kind of memory do you want to create together?”

From there, the app orchestrates three ingredients:

1.  **Your Squad** – real people, with preserved identities.
    
2.  **Your Closet** – real garments you actually own.
    
3.  **The World** – real locations that match a described vibe.
    

The result is a **single, shared visual answer** that compresses dozens of micro-decisions: where to go, what to wear, whether the place fits your style, and how your group will visually “fit” in that scene.

This is far more than a filter or a collage. It is a **multi-step multimodal reasoning flow**, where Gemini 3 Pro is asked to understand:

*   Who you are (faces, body types, outfits).
    
*   What you own (wardrobe).
    
*   What you want (textual vibe prompts).
    
*   Where in the real world that vibe exists (place search by description).
    
*   How to compose all of this into a coherent, believable image.
    

Why This Is Only Possible Now: Gemini 3 + “Nano Banana”
-------------------------------------------------------

Traditional image generation stacks for virtual try-on required heavy infrastructure and complex pipelines:

*   Custom LoRA or fine-tuning per user just to maintain facial identity.
    
*   Dedicated GPU servers to host diffusion models.
    
*   Complex glue code to stitch images and backgrounds.
    

SQUADVIBE instead builds directly on **Gemini 3 Pro Image** (“Nano Banana Pro”) and Gemini’s text models:

*   **Character Consistency with Reference Images**Gemini 3 can ingest several selfies and maintain identity across generations, without custom training. This is crucial for trust: if users don’t recognize themselves, the product fails.
    
*   **Native Multimodality**The same stack can reason over text descriptions, real-world locations, and multiple images (faces, garments, background) in a single call. That means fewer fragile integrations, and more room for creative prompting and orchestration.
    
*   **Grounded Real-World Context**Instead of hallucinated fantasy locations, SQUADVIBE works with locations that are actually visitable. The text model reasons about **vibes and places**, then these are tied to real imagery for background composition.
    
*   **Scalability Without Owning the Model**Because Google handles the heavy modeling in AI Studio / Vertex AI, the hackathon project can focus on the **product**, not on DevOps. That’s exactly aligned with the spirit of Vibe Coding: build complex experiences quickly by standing on Gemini’s shoulders.
    

What used to require expert ML engineering is now accessible as a product surface that can be shaped within the hackathon timeframe.

The User Journey: From Chaos to a Single Shot
---------------------------------------------

### 1\. Build Your Squad

In the **Squad** tab, users upload selfies—simple, casual photos. They don’t need studio conditions.

SQUADVIBE passes those photos to Gemini 3 Pro Image with a role as a fashion photographer: regenerate the person as a full-body model pose, clean background, while strictly preserving identity (face, hair, body type). The outcome is a consistent “casting photo” for each squad member.

The key outcome:

*   Everyone becomes visually **compatible** with the composition pipeline.
    
*   Faces remain recognizable.
    
*   Users feel that “this is really me,” not an AI lookalike.
    

### 2\. Build Your Closet

In the **Closet** tab, each garment is captured:

*   Tops, bottoms, outerwear, shoes, accessories.
    
*   Gemini analyzes garments to categorize them and extract useful metadata like color and tags.
    

Over time, the app becomes a structured digital wardrobe, not just a gallery of random photos. For the hackathon demo, even a small sample wardrobe is enough to show the power: each item can be precisely assigned to a person later.

### 3\. Search for the Vibe

The **Studio** is where SQUADVIBE comes alive.

Instead of searching by coordinates, users type natural prompts about the experience they want:

*   “Hidden rooftop in Hanoi old quarter, warm lights, great for couple photos.”
    
*   “Cozy Da Lat café, valley view, wooden interior, perfect for pastel sweaters.”
    
*   “Street-food alley in Saigon, lots of neon and motion, night-time energy.”
    

Gemini uses text reasoning to propose **concrete locations** that match:

*   Place name and description.
    
*   Implied mood and dress code.
    
*   Best time to visit and practical tips.
    

The app then fetches real images for those places: this becomes the **visual anchor** of the final composition. Your future hangout is not an abstract idea; it’s tied directly to a recognizable place.

### 4\. Cast, Style, and Compose

Once a place is selected, SQUADVIBE lets you choose:

*   Who is in the shot (cast selection).
    
*   Which outfits each person will wear (wardrobe assignment).
    
*   Whether to first run a **virtual try-on step** (dress models) or skip straight to composition (for quick previews).
    

Behind the scenes, SQUADVIBE orchestrates a two-phase pipeline:

1.  **Virtual Try-On (Optional but powerful)**
    
    *   For each included member, Gemini generates a dressed version of the person wearing the chosen garment.
        
    *   Identity is preserved; the outfit is realistically draped and tailored.
        
    *   These dressed models become reusable assets.
        
2.  **Scene Composition**
    
    *   Gemini is given multiple inputs: the real background image(s), the dressed models (or original photos, if skip-try-on is enabled), and a textual description of the scene vibe.
        
    *   It is instructed to analyze perspective, lighting, geometry, and scale; then place the squad naturally in the environment.
        
    *   Poses are adapted to context: sitting at a café table, leaning on a railing, walking casually, etc.
        
    *   Shadows, reflections, and color grading are aligned to make the outcome feel like a single, coherent photograph.
        

The result is not a collage; it feels like a shot from a professional lifestyle campaign—with your friends as the models, in clothes you actually own, at a place you can navigate to on Google Maps.

Why This Project Is Novel
-------------------------

SQUADVIBE combines several threads that are rarely aligned:

*   **Squad-Level instead of Individual-Level**Most generative fashion or try-on experiences think in terms of one user, one body. We design for _group alignment_ and social energy.
    
*   **Grounded Places instead of Fantasy Worlds**The background is not imaginary. It is a real café, rooftop, alley, or viewpoint that exists in the world. The project treats AI not as an escape from reality, but as a **bridge into it**.
    
*   **End-to-End Multimodality, Not Just “Image From Text”**Every step is multimodal: images of faces, garments, real locations, and text-based prompts about vibe and style all interact. Gemini is used as a reasoning engine, not just a one-shot “give me a cool picture” tool.
    
*   **Emotionally Clear Value**Users immediately understand why this is useful: it reduces anxiety, increases confidence, and makes planning feel fun and creative. The AI is not the hero; the **experience** is.
    

This aligns tightly with the hackathon’s goal: build something that _couldn’t really work yesterday_, but is suddenly natural with Gemini 3 Pro.
