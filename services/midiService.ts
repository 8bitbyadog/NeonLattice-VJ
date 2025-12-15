export class MidiService {
  private midiAccess: any = null;
  private inputs: any[] = [];
  public onNoteOn: ((note: number, velocity: number) => void) | null = null;
  public onControlChange: ((cc: number, value: number) => void) | null = null;

  async initialize() {
    const nav = navigator as any;
    if (!nav.requestMIDIAccess) {
      console.warn("Web MIDI API not supported in this browser.");
      return;
    }

    try {
      this.midiAccess = await nav.requestMIDIAccess();
      this.refreshInputs();
      
      this.midiAccess.onstatechange = () => {
        this.refreshInputs();
      };
    } catch (err) {
      console.error("Could not access MIDI devices.", err);
    }
  }

  refreshInputs() {
    if (!this.midiAccess) return;
    this.inputs = Array.from(this.midiAccess.inputs.values());
    
    this.inputs.forEach((input: any) => {
      input.onmidimessage = this.handleMidiMessage.bind(this);
    });
    console.log(`Connected to ${this.inputs.length} MIDI inputs.`);
  }

  handleMidiMessage(message: any) {
    const [status, data1, data2] = message.data;
    const command = status >> 4;
    // const channel = status & 0xf;

    if (command === 9 && data2 > 0) { // Note On
      if (this.onNoteOn) this.onNoteOn(data1, data2);
    } else if (command === 11) { // Control Change (CC)
      if (this.onControlChange) this.onControlChange(data1, data2);
    }
  }

  getInputs() {
    return this.inputs;
  }
}

export const midiService = new MidiService();