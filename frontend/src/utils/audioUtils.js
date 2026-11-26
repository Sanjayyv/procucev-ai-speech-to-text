
export const convertToPCM16 = (inputData, inputSampleRate, outputSampleRate = 16000) => {
  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.floor(inputData.length / ratio);
  const output = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    const sample1 = inputData[index] || 0;
    const sample2 = inputData[index + 1] || sample1;

    const sample = sample1 + (sample2 - sample1) * fraction;
    const clamped = Math.max(-1, Math.min(1, sample));

    output[i] = clamped < 0
      ? clamped * 32768
      : clamped * 32767;
  }

  return output;
};

export const pcmToBase64 = (pcmData) => {
  const bytes = new Uint8Array(
    pcmData.buffer,
    pcmData.byteOffset,
    pcmData.byteLength
  );

  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};
