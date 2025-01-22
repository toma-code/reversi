const STONE = 0;
const PAPER = 1;
const SCISSORS = 2;

type HandGenerator = {
  generate(): number;
};

class RandomHandGenerator implements HandGenerator {
  generate(): number {
    return Math.floor(Math.random() * 3);
  }

  generateArray(): number[] {
    return [];
  }
}

class Janken {
  play() {
    const handGenerator = new RandomHandGenerator();
    const computerHand = handGenerator.generate();

    console.log(`computer = ${computerHand}`);
  }
}

const janken = new Janken();
janken.play();
