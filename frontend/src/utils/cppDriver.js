// Converts LeetCode-style C++ (a `Solution` class with one public method)
// into a runnable program by generating a `main()` that:
//   • reads each argument from stdin (one argument per line)
//   • calls Solution().method(args...)
//   • prints the return value in LeetCode's format (e.g. 10, [0,1], true)
//
// Input convention (one line per argument, in order):
//   • scalars (int/double/bool/char/string): the raw value, quotes/brackets optional
//   • vectors: space- or comma-separated, surrounding [ ] optional
//
// Falls back to a clearly-marked TODO template for types it can't parse.

const DRIVER_START = "// ===== auto-generated driver (editable) =====";

// Split "a, vector<int> b, pair<int,int> c" on TOP-LEVEL commas only.
function splitTopLevel(str) {
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of str) {
    if (ch === "<" || ch === "(" || ch === "[") depth++;
    else if (ch === ">" || ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const normalizeType = (t) =>
  t.replace(/\bconst\b/g, "")
    .replace(/[&*]/g, "")
    .replace(/\s*<\s*/g, "<")
    .replace(/\s*>\s*/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// "vector<int>& nums" -> { type: "vector<int>", name: "nums" }
function parseParam(p) {
  const cleaned = p.replace(/\bconst\b/g, "").trim();
  const m = cleaned.match(/([A-Za-z_]\w*)\s*$/);
  if (!m) return null;
  const name = m[1];
  const type = normalizeType(cleaned.slice(0, m.index));
  return { type, name };
}

// Find `class Solution { ... }` and its first real public method.
function parseSolution(code) {
  const classMatch = code.match(/class\s+Solution\s*\{([\s\S]*)\}\s*;?/);
  const body = classMatch ? classMatch[1] : code;

  // Match: <returnType> <name>(<params>) [const] {
  const re = /([A-Za-z_][\w:<>,\s&*]*?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const returnType = normalizeType(m[1]);
    const name = m[2];
    if (!returnType || name === "Solution" || name === "if" || name === "for" || name === "while" || name === "switch") {
      continue; // skip constructors / control keywords
    }
    const params = splitTopLevel(m[3]).map(parseParam).filter(Boolean);
    return { returnType, name, params };
  }
  return null;
}

// Per-type: code that turns a `string` line variable into a typed C++ variable.
function readerFor(type, name, lineVar) {
  switch (type) {
    case "int":       return `    int ${name} = __toi(${lineVar});`;
    case "long":
    case "longlong":
    case "long long": return `    long long ${name} = __tol(${lineVar});`;
    case "double":
    case "float":     return `    double ${name} = __tod(${lineVar});`;
    case "bool":      return `    bool ${name} = __tob(${lineVar});`;
    case "char":      return `    char ${name} = __toc(${lineVar});`;
    case "string":    return `    string ${name} = __tos(${lineVar});`;
    case "vector<int>":         return `    vector<int> ${name} = __vi(${lineVar});`;
    case "vector<longlong>":
    case "vector<long long>":   return `    vector<long long> ${name} = __vl(${lineVar});`;
    case "vector<double>":      return `    vector<double> ${name} = __vd(${lineVar});`;
    case "vector<string>":      return `    vector<string> ${name} = __vs(${lineVar});`;
    case "vector<char>":        return `    vector<char> ${name} = __vc(${lineVar});`;
    default:
      return `    /* TODO: read ${type} ${name} from ${lineVar} manually */\n    ${type} ${name}{};`;
  }
}

// Per-return-type: code that prints the result `ans` in LeetCode format.
function printerFor(type) {
  if (type === "void") return "    sol." ; // handled by caller
  if (type === "bool") return `    cout << (ans ? "true" : "false") << "\\n";`;
  if (/^vector<vector<.*>>$/.test(type)) return `    __print2d(ans);`;
  if (/^vector</.test(type)) return `    __print1d(ans);`;
  return `    cout << ans << "\\n";`;
}

const HELPERS = `// --- auto-generated input/output helpers ---
static string __strip(const string& x){
    size_t a = x.find_first_not_of(" \\t\\r\\n\\"[]");
    if (a == string::npos) return "";
    size_t b = x.find_last_not_of(" \\t\\r\\n\\"[]");
    return x.substr(a, b - a + 1);
}
static int    __toi(const string& x){ string s=__strip(x); return s.empty()?0:stoi(s); }
static long long __tol(const string& x){ string s=__strip(x); return s.empty()?0:stoll(s); }
static double __tod(const string& x){ string s=__strip(x); return s.empty()?0:stod(s); }
static bool   __tob(const string& x){ string s=__strip(x); return s=="true"||s=="1"; }
static char   __toc(const string& x){ string s=__strip(x); return s.empty()?' ':s[0]; }
static string __tos(const string& x){ return __strip(x); }
static vector<string> __tok(const string& x){
    vector<string> out; string cur;
    for(char c : x){ if(c==','||c==' '||c=='['||c==']'||c=='"'||c=='\\t'){ if(!cur.empty()){out.push_back(cur);cur.clear();} } else cur+=c; }
    if(!cur.empty()) out.push_back(cur);
    return out;
}
static vector<int> __vi(const string& x){ vector<int> v; for(auto&t:__tok(x)) v.push_back(stoi(t)); return v; }
static vector<long long> __vl(const string& x){ vector<long long> v; for(auto&t:__tok(x)) v.push_back(stoll(t)); return v; }
static vector<double> __vd(const string& x){ vector<double> v; for(auto&t:__tok(x)) v.push_back(stod(t)); return v; }
static vector<string> __vs(const string& x){ return __tok(x); }
static vector<char> __vc(const string& x){ vector<char> v; for(auto&t:__tok(x)) if(!t.empty()) v.push_back(t[0]); return v; }
template<class T> static void __print1d(const vector<T>& v){ cout<<"["; for(size_t i=0;i<v.size();i++){ if(i)cout<<","; cout<<v[i]; } cout<<"]\\n"; }
template<class T> static void __print2d(const vector<vector<T>>& v){ cout<<"["; for(size_t i=0;i<v.size();i++){ if(i)cout<<","; cout<<"["; for(size_t j=0;j<v[i].size();j++){ if(j)cout<<","; cout<<v[i][j]; } cout<<"]"; } cout<<"]\\n"; }`;

export function makeRunnableCpp(code) {
  // Remove any previously generated driver so re-running is idempotent.
  const stripped = code.split("\n" + DRIVER_START)[0].trimEnd();

  const parsed = parseSolution(stripped);

  // Ensure required includes exist (prepended only if missing).
  const needsInclude = !/#include\s*<bits\/stdc\+\+\.h>/.test(stripped) && !/#include/.test(stripped);
  const needsNs = !/using\s+namespace\s+std/.test(stripped);
  const header =
    (needsInclude ? "#include <bits/stdc++.h>\n" : "") +
    (needsNs ? "using namespace std;\n" : "");

  if (!parsed) {
    // Could not detect a Solution method — give a safe editable template.
    return `${header}${stripped}

${DRIVER_START}
${HELPERS}

int main() {
    // TODO: could not auto-detect Solution method.
    // Read your input from stdin and call your method here.
    return 0;
}`;
  }

  const { returnType, name, params } = parsed;

  const reads = params
    .map((p, i) => `    string __a${i}; getline(cin, __a${i});\n${readerFor(p.type, p.name, `__a${i}`)}`)
    .join("\n");

  const argList = params.map((p) => p.name).join(", ");
  const call = `sol.${name}(${argList})`;

  let body;
  if (returnType === "void") {
    body = `    ${call};`;
  } else {
    body = `    auto ans = ${call};\n${printerFor(returnType)}`;
  }

  return `${header}${stripped}

${DRIVER_START}
${HELPERS}

int main() {
    ios::sync_with_stdio(false);
${reads ? reads + "\n" : ""}    Solution sol;
${body}
    return 0;
}`;
}

export const hasGeneratedDriver = (code) => code.includes(DRIVER_START);
