class BankAccount {
private:
	int number;
	char string;
	float balance;
public:
	void deposit(float amount);
	void withdraw(float amount);
};

class CheckingAccount : public BankAccount {
private:
	float overdraftlimite;
public:
	void withdraw(float amount);
	void transfer(float amount, BankAccount account);
};

class SavingsAccount : public BankAccount {
private:
	float annualIntersetRate;
public:
	void depositAnualInterset();
};