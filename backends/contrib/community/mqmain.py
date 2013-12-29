import cmty
import zerorpc
import json
import gevent

class ServerRPC(object):
    def run(self, graph):
        f = open('log.txt','a')
        f.write(str(graph))
        f.write('\n')
        f.write(str(json.loads(graph)))
        f.write('\n')
        f.close()
        result = cmty.run(json.loads(graph))
        return json.dumps(result)


def main():
    port = 14242
    print "run rpc server in port: " + str(port)
    s = zerorpc.Server(ServerRPC())
    s.bind("tcp://*:" + str(port))
    s.run()

if __name__ == "__main__" : main()
