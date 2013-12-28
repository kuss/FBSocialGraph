#!/usr/bin/env python
import networkx as nx
import math
import csv
import random as rand
import sys

def buildG(G, graph):
    for edge in graph:
        for edge2 in graph[edge]:
            G.add_edge(edge, edge2, weight=float(1))

#this method just reads the graph structure from the file
def buildGFromFile(G, file_, delimiter_):
    #construct the weighted version of the contact graph from cgraph.dat file
    #reader = csv.reader(open("/home/kazem/Data/UCI/karate.txt"), delimiter=" ")
    reader = csv.reader(open(file_), delimiter=delimiter_)
    for line in reader:
        if float(line[2]) != 0.0:
            G.add_edge(int(line[0]),int(line[1]),weight=float(line[2]))

#Keep removing edges from Graph until one of the connected components of Graph splits into two.
#compute the edge betweenness
def CmtyGirvanNewmanStep(G):
    #print "call CmtyGirvanNewmanStep"
    init_ncomp = nx.number_connected_components(G)    #no of components
    ncomp = init_ncomp
    while ncomp <= init_ncomp:
        bw = nx.edge_betweenness_centrality(G)    #edge betweenness for G
        #find the edge with max centrality
        max_ = 0.0
        #find the edge with the highest centrality and remove all of them if there is more than one!
        for k, v in bw.iteritems():
            _BW = float(v)/float(G[k[0]][k[1]]['weight'])    #weighted version of betweenness    
            if _BW >= max_:
                max_ = _BW
        for k, v in bw.iteritems():
            if float(v)/float(G[k[0]][k[1]]['weight']) == max_:
                G.remove_edge(k[0],k[1])    #remove the central edge
        ncomp = nx.number_connected_components(G)    #recalculate the no of components

#compute the modularity of current split
def _GirvanNewmanGetModularity(G, deg_, m_):
    New_A = nx.adj_matrix(G)
    New_deg = {}
    New_deg = UpdateDeg(New_A)
    #Let's compute the Q
    comps = nx.connected_components(G)    #list of components    
    print 'no of comp: %d' % len(comps)
    Mod = 0    #Modularity of a given partitionning

    node_list = G.nodes()
    for c in comps:
        EWC = 0    #no of edges within a community
        RE = 0    #no of random edges
        for u in c:
            EWC += New_deg[node_list.index(u)]
            RE += deg_[node_list.index(u)]        #count the probability of a random edge
        Mod += ( float(EWC) - float(RE*RE)/float(2*m_) )
    Mod = Mod/float(2*m_)
    #print "Modularity: %f" % Mod
    return Mod

def UpdateDeg(A):
    deg_dict = {}
    n = len(A)
    for i in range(n):
        deg = 0.0
        for j in range(n):
            deg += A[i,j]
        deg_dict[i] = deg
    return deg_dict

#run GirvanNewman algorithm and find the best community split by maximizing modularity measure
def runGirvanNewman(G, Orig_deg, m_):
    #let's find the best split of the graph
    BestQ = 0.0
    Q = 0.0
    print "runGirvanNewman"
    while True:    
        CmtyGirvanNewmanStep(G)
        Q = _GirvanNewmanGetModularity(G, Orig_deg, m_);
        print "current modularity: %f" % Q
        if len(nx.connected_components(G)) >= 10:
            break;
        if Q > BestQ:
            BestQ = Q
            Bestcomps = nx.connected_components(G)    #Best Split
 #           print "comps:"
 #           print Bestcomps
        if G.number_of_edges() == 0:
            break
    if BestQ > 0.0:
#        print "Best Q: %f" % BestQ
#        print Bestcomps
        result_data = {};
        result_data['num_clusters'] = len(Bestcomps)
        result_data['list'] = Bestcomps
        return result_data
    else:
#        print "Best Q: %f" % BestQ
        result_data = {};
        result_data['num_clusters'] = len(nx.connected_components(G))
        result_data['list'] = nx.connected_components(G)
        return result_data

def run(graph):
    G = nx.Graph()
    buildG(G, graph)

    n = G.number_of_nodes()    #|V|
    A = nx.adj_matrix(G)    #adjacenct matrix

    m_ = 0.0    #the weighted version for number of edges
    for i in range(0,n):
        for j in range(0,n):
            m_ += A[i,j]
    m_ = m_/2.0
    print "m: %f" % m_

    #calculate the weighted degree for each node
    Orig_deg = {}
    Orig_deg = UpdateDeg(A)

    #run Newman alg
    return runGirvanNewman(G, Orig_deg, m_)

def main(argv):
    if len(argv) < 2:
        sys.stderr.write("Usage: %s <input graph>\n" % (argv[0],))
        return 1
    graph_fn = argv[1]
    G = nx.Graph()  #let's create the graph first
    buildGFromFile(G, graph_fn, ',')

    n = G.number_of_nodes()    #|V|
    A = nx.adj_matrix(G)    #adjacenct matrix

    m_ = 0.0    #the weighted version for number of edges
    for i in range(0,n):
        for j in range(0,n):
            m_ += A[i,j]
    m_ = m_/2.0
    print "m: %f" % m_

    #calculate the weighted degree for each node
    Orig_deg = {}
    Orig_deg = UpdateDeg(A)

    #run Newman alg
    runGirvanNewman(G, Orig_deg, m_)

#if __name__ == "__main__":
#    sys.exit(main(sys.argv))
