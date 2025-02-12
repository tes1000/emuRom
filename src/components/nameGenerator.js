const generateRandomName = (selectedRom) => {
  const adjectives = [
    "Bouncy", "Fluffy", "Happy", "Jolly", "Giggly", "Zippy", "Silly",
    "Wiggly", "Cuddly", "Snuggly", "Peppy", "Sparkly", "Cheeky", "Chirpy",
    "Bubbly", "Goofy", "Squeaky", "Twirly", "Wobbly", "Dizzy"
  ];
  
  const nouns = [
    "Bunny", "Kitten", "Puppy", "Cupcake", "Marshmallow", "Sprinkle", "Doodle",
    "Snugglebug", "Pancake", "Rainbow", "Unicorn", "Giggles", "Teddy", "Peach",
    "Jellybean", "Waffle", "Gummybear", "Buttercup", "Lollipop", "Muffin"
  ];

  const cuteEmojis = ["💖", "🌈", "✨", "🦄", "🎀", "🍭", "🍓", "🐰"];

  // Pick a random adjective and noun
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 10); // Keep numbers kid-friendly
  const randomEmoji = cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];

  // Generate the final name
  const newName = `${randomAdjective}${randomNoun}${randomNumber} ${randomEmoji}`;

  // Check if the name already exists in selectedRom?.config?.save
  if (selectedRom?.config?.save?.includes(newName)) {
    console.warn(`Duplicate name found: ${newName}, generating a new one...`);
    return generateRandomName(selectedRom); // Recursively call itself if name exists
  }

  return newName;
};

export default generateRandomName;