let word = ""
for (let i = 0 ; i<100;i++){
    if (i%5==0 && i%3==0){
        word += "FizzBuzz"
    } else if (i%3==0){
        word += "Fizz"
    }
    else if (i%5==0){
        word += "Buzz"
    }
    console.log(i,word)
    word=""

}