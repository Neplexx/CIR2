#include <iostream>
#include <vector>
#include <queue>
#include <climits>

std::vector<std::vector<int>> grapheEtCapacites(7, std::vector<int>(7, 0));

bool parcoursLargeur(const std::vector<std::vector<int>>& grapheResiduel, int s, int t, std::vector<int>& predDansCheminAmeliorant) {
    int nbSommets = grapheResiduel.size();
    std::vector<bool> sommetVisite(nbSommets, false);
    std::queue<int> file;
    file.push(s);
    sommetVisite[s] = true;
    predDansCheminAmeliorant[s] = -1;
    while (!file.empty()) {
        int u = file.front();
        file.pop();
        for (int v = 0; v < nbSommets; v+=1) {
            if (!sommetVisite[v] && grapheResiduel[u][v] > 0) {
                file.push(v);
                predDansCheminAmeliorant[v] = u;
                sommetVisite[v] = true;
            }
        }
    }
    return sommetVisite[t];
}

int fordFulkerson(const std::vector<std::vector<int>>& grapheEtCapacites, int s, int t) {
    int nbSommets = grapheEtCapacites.size();
    int u, v;
    std::vector<std::vector<int>> grapheResiduel = grapheEtCapacites;
    std::vector<int> predDansCheminAmeliorant(nbSommets);
    int max_flow = 0;
    while (parcoursLargeur(grapheResiduel, s, t, predDansCheminAmeliorant)) {
        int ameliorationFlot = INT_MAX;
        for (v = t; v != s; v = predDansCheminAmeliorant[v]) {
            u = predDansCheminAmeliorant[v];
            ameliorationFlot = std::min(ameliorationFlot, grapheResiduel[u][v]);
        }
        for (v = t; v != s; v = predDansCheminAmeliorant[v]) {
            u = predDansCheminAmeliorant[v];
            grapheResiduel[u][v] -= ameliorationFlot;
            grapheResiduel[v][u] += ameliorationFlot;
        }
        max_flow += ameliorationFlot;
    }
    return max_flow;
}

int main() {
    grapheEtCapacites[0][1] = 50;
    grapheEtCapacites[0][2] = 70;
    grapheEtCapacites[0][3] = 40;
    grapheEtCapacites[1][4] = 60;
    grapheEtCapacites[2][4] = 40;
    grapheEtCapacites[2][5] = 50;
    grapheEtCapacites[3][5] = 30;
    grapheEtCapacites[4][6] = 80;
    grapheEtCapacites[5][6] = 70;

    int resultat = fordFulkerson(grapheEtCapacites, 0, 6);
    std::cout << "flot : " << resultat << std::endl;

    return 0;
}
