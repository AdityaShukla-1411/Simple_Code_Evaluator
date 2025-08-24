'''Check kar ke batana isko sahi hai ki nhi as a sample'''

function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === Math.floor(arr.length / 2)) continue;

    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Test the function
const testArray = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42];
console.log("Original:", testArray);
console.log("Sorted:", quickSort(testArray));

