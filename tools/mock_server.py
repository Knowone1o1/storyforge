# Local test server: serves the page and FAKES the AI, so testing uses no Gemini quota.
# Run:  python tools/mock_server.py   then open http://localhost:8765
import json, os, sys, http.server, functools
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SCENE = {"consequence_text":"", "scene_text":"Mia and Bobo walk to Fraction Falls. They find 8 dino eggs in the grass. The eggs are warm and wobbly. A big green dino looks worried. Half of the eggs must go back to the nest. Mia has to count.", "question":"What do you do?",
 "options":[{"label":"Carry 4 eggs to the nest","hidden_type":"wise","leads_to":"The nest is safe."},{"label":"Carry 3 eggs, come back later","hidden_type":"okay","leads_to":"One egg waits."},{"label":"Slide all eggs down the falls","hidden_type":"tempting_bad","leads_to":"Eggs scatter."},{"label":"Leave the eggs alone","hidden_type":"clearly_bad","leads_to":"Eggs get cold."}],
 "meter_change":{"hearts":0,"item_gained":"","item_lost":""},"image_description":"eggs","is_ending":False,
 "lesson":"halves","title":"Dino Rescue","hero_look":"Mia in purple","warmup":{"question":"What is half of 8?","answer":"4"}}
class H(http.server.SimpleHTTPRequestHandler):
    def _json(self, obj):
        b = json.dumps(obj).encode(); self.send_response(200); self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path.startswith("/api/health"): return self._json({"ok":True,"ai":True})
        if self.path.startswith("/api/image"): # a fake painting (one of the dino book's), so the page flow can be tested for free
            import time; time.sleep(float(os.environ.get("FAKE_PAINT_SECONDS", "1.5"))) # pretend painting takes a moment
            pics = sorted(f for f in os.listdir(os.path.join(ROOT, "art", "dino")) if f.endswith(".jpg"))
            with open(os.path.join(ROOT, "art", "dino", pics[abs(hash(self.path)) % len(pics)]), "rb") as fh: data = fh.read()
            self.send_response(200); self.send_header("Content-Type", "image/jpeg"); self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data); return
        return super().do_GET()
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        p = body["prompt"]
        opts4 = lambda q: [{"label":q+" the wise way","hidden_type":"wise","leads_to":"It works.","coach":""},{"label":q+" the slow way","hidden_type":"okay","leads_to":"Slow but fine.","coach":""},{"label":q+" the wild way","hidden_type":"tempting_bad","leads_to":"A mess.","coach":"Wild is fun, but counting first works better."},{"label":q+" not at all","hidden_type":"clearly_bad","leads_to":"Nothing happens.","coach":"Helping is the kind thing to do."}]
        if "write only the plan and chapter 1" in p:
            text = json.dumps({"title":"Kai and the Fox","lesson":"taking away","hero_look":"Kai, a kid in a green shirt","cast":"Kai, a boy in a green shirt; a small orange fox","check":{"question":"What is 3 take away 1?","answer":"2"},"chapter":{"pages":["Kai walks to the hill.","He sees 3 red balls.","A fox says hello.","The fox takes 1 ball.","Kai counts the balls again.","Now there are 2 balls."],"question":"What should Kai do?","options":opts4("Do it")}})
        elif "write 4 different versions of" in p:
            import time; time.sleep(0.4)
            ending = "the ENDING" in p
            names = ["WISE","OKAY","WILD","BAD"]
            depth = "3" if "chapter 3" in p else "2"
            vs = []
            for nm in names:
                if ending: vs.append({"pages":[nm+" ending, page one.","It goes on.","Everyone is home.","The end."]})
                else: vs.append({"pages":[nm+" path, chapter "+depth+", page one.","This is what that choice caused.","Then they walk on.","They find 4 apples.","A bird lands.","Kai thinks."],"question":"What now, after "+nm+"?","options":opts4("Go on")})
            text = json.dumps({"versions":vs})
        elif "PART 1:" in p and "parts" in p:
            n = p.count("PART ")
            sc = lambda k: {"sky":"#8CCBFF","ground":"#7FCF86","time":"day","characters":[{"kind":"kid","color":"#22B573","skin":"#F2C29B","hair":"#2B2B3A","hairstyle":"short","move":"wave"},{"kind":"fox","move":"idle"}],"props":[{"type":"ball","count":k,"color":"#E8413C"}],"scenery":[{"type":"hill","x":-3,"z":-3},{"type":"tree","x":4,"z":-2},{"type":"cloud","x":0,"z":-2},{"type":"sun","x":4,"z":-2}]}
            text = json.dumps({"parts":[{"scenes":[sc(3),sc(2),sc(1)]} for _ in range(n)]})
        elif "WHOLE short picture book" in p:
            opts = lambda q: [{"label":q+" the wise way","hidden_type":"wise","leads_to":"It works.","result":"It works well. Everyone cheers.","coach":""},{"label":q+" the slow way","hidden_type":"okay","leads_to":"Slow but fine.","result":"It takes a while, but it works.","coach":""},{"label":q+" the wild way","hidden_type":"tempting_bad","leads_to":"A mess.","result":"What a mess! They tidy up and try again.","coach":"Wild is fun, but counting first works better."},{"label":q+" not at all","hidden_type":"clearly_bad","leads_to":"Nothing happens.","result":"Nothing gets done. They go back and help.","coach":"Helping is the kind thing to do."}]
            ch = lambda k: {"pages":["Kai walks to the hill, part %d." % k,"He sees 3 red balls.","A fox says hello.","The fox takes 1 ball.","Kai counts the balls again.","Now there are 2 balls."],"question":"What should Kai do in part %d?" % k,"options":opts("Do it")}
            text = json.dumps({"title":"Kai and the Fox","lesson":"taking away","hero_look":"Kai, a kid in a green shirt","cast":"Kai, a boy in a green shirt; a small orange fox","check":{"question":"What is 3 take away 1?","answer":"2"},"chapters":[ch(1),ch(2),ch(3)],"ending_good":["Kai and the fox are friends.","They share the balls. The end."],"ending_mixed":["It took a few tries.","Kai and the fox share. The end."]})
        elif "Guardian agent" in p and "LINES:" in p: text = json.dumps({"approved":True,"note":"all pages are safe","replace":[]})
        elif "for chapter" in p and "moments" in p:
            sc = lambda n, mv: {"sky":"#8CCBFF","ground":"#7FCF86","time":"day","characters":[{"kind":"kid","color":"#22B573","skin":"#F2C29B","hair":"#2B2B3A","hairstyle":"short","move":mv},{"kind":"fox","move":"idle"}],"props":[{"type":"ball","count":n,"color":"#E8413C"}],"scenery":[{"type":"hill","x":-3,"z":-3},{"type":"tree","x":4,"z":-2},{"type":"cloud","x":0,"z":-2},{"type":"sun","x":4,"z":-2},{"type":"bush","x":-4,"z":-1.5}]}
            text = json.dumps({"moments":[sc(3,"wave"),sc(3,"idle"),sc(2,"hop")],"outcomes":[sc(2,"wave"),sc(2,"idle"),sc(1,"hop"),sc(3,"idle")]})
        elif "3D scene" in p: text = json.dumps({"sky":"#8CCBFF","ground":"#7FCF86","time":"day",
          "characters":[{"kind":"kid","color":"#7B5CFF","skin":"#F2C29B","hair":"#5A3A22","hairstyle":"pigtails","move":"wave"},{"kind":"dog","color":"#C98B4F","move":"hop"},{"kind":"dino","size":1.3,"color":"#4DBB6D"},{"kind":"bird","color":"#39A0FF"}],
          "props":[{"type":"egg","count":8}],
          "scenery":[{"type":"mountain","x":-3.5,"z":-2.5,"size":1.4},{"type":"tree","x":-4,"z":0,"size":1.2},{"type":"pine","x":3.8,"z":-1.5,"size":1.3},{"type":"cloud","x":-2,"z":-1},{"type":"cloud","x":-1.6,"z":-2,"size":1.3},{"type":"sun","x":4,"z":-2},
            {"type":"pond","x":2.5,"z":1.5},{"type":"house","x":0.5,"z":-2.2,"size":1.2,"color":"#FFD27A","color2":"#FF6B5E"},{"type":"bush","x":0.6,"z":-2.1},{"type":"flower","x":-0.5,"z":2.4},{"type":"rock","x":4.2,"z":1},{"type":"mushroom","x":-4.6,"z":2.6},{"type":"tree","x":0,"z":1.5}]})
        elif "Illustrator agent" in p: text = '<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="450" fill="#bde"/><circle cx="400" cy="225" r="80" fill="#fc3"><animate attributeName="r" values="80;95;80" dur="3s" repeatCount="indefinite"/></circle></svg>'
        elif "Director agent" in p:
            s = dict(SCENE)
            if "ENDING scene" in p: s.update(options=[], is_ending=True, consequence_text="The nest is safe.", scene_text="Everyone cheers. The end.")
            elif "(nothing yet" not in p: s.update(consequence_text="The eggs scatter and one rolls away.")
            text = "Here you go:\n" + json.dumps(s)
        elif "Guardian agent" in p: text = json.dumps({"approved":True,"note":"safe (tier=%s)" % body.get("tier"),"fixed":None})
        elif "Coach agent" in p: text = json.dumps({"coach_reply":"Great thinking!"})
        elif "Reflector agent" in p: text = json.dumps({"before_correct":False,"after_correct":True,"wise_choices":2,"total_choices":3,"summary":"Good session.","highlights":["Counted halves"],"child_quote":"carry four","conversation_starter":"What is half of your cookies?"})
        else: text = json.dumps({"option_index":0,"lesson":"halves"})
        self._json({"text":text})
PORT = int(os.environ.get("PORT", "8765"))
http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(H, directory=ROOT)).serve_forever()
