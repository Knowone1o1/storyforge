# Local test server: serves the page and FAKES the AI, so testing uses no Gemini quota.
# Run:  python tools/mock_server.py   then open http://localhost:8765
import json, os, sys, http.server, functools
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SCENE = {"consequence_text":"", "scene_text":"Mia and Bobo find 8 dino eggs by the falls. Half must go to the nest.", "question":"What do you do?",
 "options":[{"label":"Carry 4 eggs to the nest","hidden_type":"wise","leads_to":"The nest is safe."},{"label":"Carry 3 eggs, come back later","hidden_type":"okay","leads_to":"One egg waits."},{"label":"Slide all eggs down the falls","hidden_type":"tempting_bad","leads_to":"Eggs scatter."},{"label":"Leave the eggs alone","hidden_type":"clearly_bad","leads_to":"Eggs get cold."}],
 "meter_change":{"hearts":0,"item_gained":"","item_lost":""},"image_description":"eggs","is_ending":False,
 "lesson":"halves","title":"Dino Rescue","hero_look":"Mia in purple","warmup":{"question":"What is half of 8?","answer":"4"}}
class H(http.server.SimpleHTTPRequestHandler):
    def _json(self, obj):
        b = json.dumps(obj).encode(); self.send_response(200); self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path.startswith("/api/health"): return self._json({"ok":True,"ai":True})
        return super().do_GET()
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        p = body["prompt"]
        if "Illustrator agent" in p: text = '<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="450" fill="#bde"/><circle cx="400" cy="225" r="80" fill="#fc3"/></svg>'
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
http.server.ThreadingHTTPServer(("127.0.0.1", 8765), functools.partial(H, directory=ROOT)).serve_forever()
