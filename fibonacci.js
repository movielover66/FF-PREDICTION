export const fibonacciAgent = {
    name: "Fibonacci Logic",
    weight: 1.7,
    analyze(n1, n2) {
        return (parseInt(n1) + parseInt(n2)) % 10;
    }
};
