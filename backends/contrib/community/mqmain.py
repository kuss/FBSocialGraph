import cmty
import zerorpc
import json

class ServerRPC(object):
    def run(self, graph):
        result = cmty.run(json.loads(graph))
        return json.dumps(result)


def main():
    s = zerorpc.Server(ServerRPC())
    s.bind("tcp://*:4242")
    s.run()

if __name__ == "__main__" : main()
