const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

numbers.forEach((number, i) => {
  const double = number * 2;
  console.log(`${i}: ${double}`);
});

const names = ["Alice", "Bob", "Carol"];
const users = names.map((n, i) => {
  return {
    id: i,
    name: n,
  };
});
console.log(users);

const evenIdUsers = users.filter((user, i) => {
  return i % 2 === 0;
});
console.log(evenIdUsers);

const sum = numbers.reduce((previous, current) => previous + current, 0);
console.log(sum);
