import testLibraryScan from "./libraryScan.test.js";
import testGameStart from "./gameStart.test.js";

// Run all tests
console.log("--- Library scan ---");
await testLibraryScan(false);

console.log("\n--- Game start ---");
await testGameStart();