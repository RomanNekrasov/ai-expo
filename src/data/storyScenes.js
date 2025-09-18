export const storyScenes = [
  {
    type: 'hero',
    title: 'AI op Legacy Hardware',
    description: 'Een reis door lokale AI-verwerking',
    blobState: 'normal',
    ctaText: 'Begin Experience'
  },
  {
    type: 'text',
    title: 'Fat Clients van Team Geo',
    description:
      "Van 2000 tot 2025 gebruikte Team Geo krachtige werkstations voor geografische berekeningen en analyses. Deze 'fat clients' zijn uitgerust met GPU's.",
    blobState: 'normal',
    backgroundImage: 'src/assets/kaart.png',
    points: [
      'Fat Clients verhuis naar de cloud',
      'Oude machines afgeschreven',
      'Geo Workloads zijn te vertalen naar AI workloads'
    ]
  },
  {
    type: 'split',
    title: 'Links: De LLM Machine',
    description:
      'Deze PC host een Large Language Model dat tekst begrijpt en genereert door woorden om te zetten naar vectoren in een multidimensionale ruimte.',
    blobState: 'left',
    code: `// Word naar vector transformatie
const wordVector = embedding_layer(token);
// [0.2, -0.8, 0.1, 0.9, ...]
// Attention mechanism
const attention = softmax(
  query * key_transpose / sqrt(dim));`,
    image: 'src/assets/vectors.jpeg',
    imageAlt: 'LLM Word Vector Visualization'
  },
  {
    type: 'split-reverse',
    title: 'Rechts: De Whisper Machine',
    description:
      "Deze PC transcribeert spraak naar tekst met OpenAI's Whisper model. Audio wordt omgezet naar spectrogrammen en vervolgens gedecodeerd naar woorden.",
    blobState: 'right',
    code: `// Audio preprocessing
const spectrogram = melSpectrogram(audio);
// 80 mel-frequency bins
// Encoder-decoder architectuur
const encoded = encoder(spectrogram);
const tokens = decoder(encoded);`,
    image: 'src/assets/Spectrograms.jpg',
    imageAlt: 'Whisper Audio Processing Pipeline'
  },
  {
    type: 'utp',
    title: 'Lokale AI Verwerking',
    description:
      'De computers hebben geen internetverbinding en communiceren alleen via een UTP-kabel. Alle AI-verwerking gebeurt lokaal, zonder externe afhankelijkheden.',
    blobState: 'normal',
    points: [
      'Geen internetverbinding - volledig offline systeem',
      'Directe communicatie via UTP ethernet kabel',
      'Alle data blijft lokaal en privé'
    ]
  },
  {
    type: 'chat',
    title: 'Probeer het Zelf',
    blobState: 'left'
  },
  {
    type: 'whisper',
    title: 'Real-time Spraakherkenning',
    blobState: 'right'
  },
  {
    type: 'conversation',
    title: 'Spraakconversatie met AI',
    description:
      'Voer een natuurlijk gesprek met de AI via je stem. Spreek natuurlijk en de AI zal antwoorden.',
    blobState: 'normal'
  },
  {
    type: 'text',
    title: 'We bepalen zelf de koers',
    description:
      'Deze demonstratie laat zien hoe we AI toegankelijk maken voor overheden, onafhankelijk van grote techbedrijven. Zo behouden we privacy, controle en bepalen we zélf de koers.',
    blobState: 'normal',
    showCompass: true
  }
]
