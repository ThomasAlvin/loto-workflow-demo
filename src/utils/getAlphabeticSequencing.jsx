export default function getAlphabeticSequencing(steps) {
  const usedLetters = new Set(
    steps
      ?.filter((step) => step.multiLockAccess) // 👈 Filter only relevant steps
      .map((step) => step.multiLockAccessGroup?.name)
  );
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i); // 65 = 'A'
    if (!usedLetters.has(letter)) {
      return letter;
    }
  }
  //   throw new Error("All group letters from A–Z are used");
}
