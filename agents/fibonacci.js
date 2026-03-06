export const fibonacciAgent = {
    name: "Fibonacci Logic",
    weight: 1.7,
    analyze(lastRes, n2) {
        // n2 যদি undefined বা null হয়, তাহলে 5 ধরব, অন্যথায় n2-এর মান নেব
        const second = (n2 !== undefined && n2 !== null) ? n2 : 5;
        const last = parseInt(lastRes) || 0;
        const result = (last + second) % 10;
        
        console.log(`🔢 FibonacciAgent: (${last} + ${second}) % 10 = ${result}`);
        return result;
    }
};