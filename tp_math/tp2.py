def v(n):
    result = 0
    for i in range(1, n+1):
        result = 2*result + 1
        print(f" v({i}) = {result} : 2*v({i-1}) + 1")
    return result
v(5)

#On observe un résultat qui nous fait penser à la suite du nombre de coups nécessaires pour résoudre la "tour de Hanoi"