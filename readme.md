# Sticker Dream

Sticker Dream is a playful web app that transforms your uploads into sticker-ready artwork using OpenAI's `gpt-image-1`. Pick a style, generate the art, and instantly preview it on merch like stickers, mugs, or posters.

## Getting started

1. Install dependencies
   ```bash
   npm install
   ```
2. Provide your OpenAI API key
   ```bash
   cp .env.example .env
   # edit .env to include OPENAI_API_KEY
   ```
3. Run the development server
   ```bash
   npm run dev
   ```

The app will be served on [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name              | Description                               |
| ----------------- | ----------------------------------------- |
| `OPENAI_API_KEY`  | Required to call OpenAI image generation. |
| `PORT`            | Optional port override for the server.    |

If the API key is not present the app returns a mocked sticker preview so you can still demo the flow.

## Project structure

```
.
├── public/            # Static client app
│   ├── app.js         # Front-end logic
│   ├── index.html     # Main UI markup
│   ├── styles.css     # Tailored styling
│   └── assets/        # Mock product imagery
├── server.js          # Express server + OpenAI integration
├── package.json
└── readme.md
```

## License

MIT
