export const fibonacciAgent = {
    name: "Fibonacci Logic",
    weight: 1.7,
    analyze(lastRes, n2) {
        // n2 যদি undefined বা null হয়, তাহলে 5 ধরব, অন্যথায় n2-এর মান নেব
        const second = (n2 !== undefined && n2 !== null) ? n2 : 5;
        return (parseInt(lastRes) + second) % 10;
    }
};