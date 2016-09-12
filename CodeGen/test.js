var arr = [1, 3, "123"];
// console.log(arr.length);

function string2int(s) {
    return s.split("").map(function (x) {
        return x - '0';
    }).reduce(function (x, y) {
        return x * 10 + y;
    });
}

function normalize(arr) {
    return arr.map(function (x) {
        return x.toLowerCase();
    }).map(function (x) {
        if (x.length > 0) {
            return x[0].toUpperCase() + x.substring(1);
        } else {
            return x;
        }
    });
}

function lazy_sum(arr) {
    var sum = function () {
        return arr.reduce(function (x, y) {
            return x + y;
        });
    };
    return sum;
}

function next_id() {
    var x = 0;
    return function () {
        x += 1
        return x;
    }
}

var next = next_id()
// console.log(next())
// console.log(next())
// console.log(next())

function* next_id1() {
    var x = 0;
    while(++x){
        yield x;
    }
}
// console.log(next_id1().next())
// console.log(next_id1().next())
// console.log(next_id1().next())

function* next_char(input) {
    for(var i = 0; i < input.length; i++){
        yield input[i];
    }
}
// var input = "123";
// var next = next_char(input);
// console.log(next.next());
// console.log(next);
// console.log(next.next());
// console.log(next.next());
// console.log(next.next());
// console.log(next.next());

var arr = ['1', '2', undefined]
console.log(arr.join(''));
arr.length = 0;
console.log(arr);
arr.push('ll');
console.log(arr);

var s = "\""
console.log(s === '"')

var modifiers = [      "public" ,"private" 
      , "protected" 
      , "static" 
      , "final" 
      , "native" 
      , "synchronized" 
      , "abstract" 
      , "transient" ];

console.log("public" in modifiers);