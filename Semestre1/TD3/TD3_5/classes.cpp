#include "classes.hpp"

void BankAccount::deposit(float amount){
	balance += amount;
}
void BankAccount::withdraw(float amount) {
	balance -= amount;
}
void CheckingAccount::withdraw(float amount) {
	if (amount <= overdraftlimite) {
		BankAccount::withdraw(amount);
	}
}
void CheckingAccount::transfer(float amount, BankAccount account) {
	account.deposit(amount);
}
void SavingsAccount::depositAnualInterset() {

}
