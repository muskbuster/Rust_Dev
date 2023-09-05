use std::io;
use rand::Rng;
use std::cmp::Ordering;
use rand::distributions::Uniform;

fn main() {
    println!("Guess the number!");

    println!("Please input your guess.");
    let secret= rand::
    thread_rng()
    .sample(Uniform::new(25u32, 150));
loop{
    let mut guess = String::new();
    io::stdin()
    .read_line(&mut guess)
    .expect("Failed to read line");

    let guess: u32 = match  guess.trim().parse(){
        Ok(num) => num,
        Err(_) => continue,
    };
    

  
    match guess.cmp(&secret) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => {println!("You win!");
        break;  }

    }


    println!("You guessed: {guess}");
}
}