export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  public isReady: boolean = false;

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new window.AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.source = this.audioContext.createMediaStreamSource(stream);
      
      this.source.connect(this.analyser);
      this.analyser.fftSize = 512;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isReady = true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }

  getAnalysis() {
    if (!this.analyser || !this.dataArray) {
      return { low: 0, mid: 0, high: 0, volume: 0, dataArray: new Uint8Array(0) };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const length = this.dataArray.length;
    // Simple band splitting
    const lowBound = Math.floor(length * 0.1);
    const midBound = Math.floor(length * 0.5);

    let lowSum = 0;
    let midSum = 0;
    let highSum = 0;
    let totalSum = 0;

    for (let i = 0; i < length; i++) {
      const val = this.dataArray[i];
      totalSum += val;
      if (i < lowBound) lowSum += val;
      else if (i < midBound) midSum += val;
      else highSum += val;
    }

    const lowAvg = lowSum / lowBound / 255;
    const midAvg = midSum / (midBound - lowBound) / 255;
    const highAvg = highSum / (length - midBound) / 255;
    const volume = totalSum / length / 255;

    return {
      low: lowAvg,
      mid: midAvg,
      high: highAvg,
      volume: volume,
      dataArray: this.dataArray
    };
  }

  cleanup() {
    if (this.source) this.source.disconnect();
    if (this.analyser) this.analyser.disconnect();
    if (this.audioContext) this.audioContext.close();
    this.isReady = false;
  }
}

export const audioService = new AudioService();