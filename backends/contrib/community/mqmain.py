import cmty
import zerorpc
import json

class ServerRPC(object):
    def run(self, graph):
        result = cmty.run(json.loads(graph))
        print result
        return json.dumps(result)


def main():
    port = 14242
    print "run rpc server in port: " + str(port)
    s = zerorpc.Server(ServerRPC())
    s.bind("tcp://*:" + str(port))
    s.run()

if __name__ == "__main__" : main()
