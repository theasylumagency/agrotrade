"""Builds cleaned catalog files from the raw agro-trade.ge snapshot (data/catalog.json)."""
import json, re, sys, collections, os
SRC = sys.argv[1]; OUT = sys.argv[2]
d = json.load(open(SRC)); P = d['products']

CATS = [
 ('moto','მოტობლოკები და კულტივატორები'),
 ('atv','კვადროციკლები'),
 ('mow','სათიბები და საკრეჭები'),
 ('spray','შეწამვლა და მორწყვა'),
 ('mill','საფქვავები და გადამამუშავებელი'),
 ('milk','საწველი აპარატები'),
 ('power','ძრავები და გენერატორები'),
 ('saw','ხერხები'),
 ('drill','მიწის ბურღები'),
 ('tire','საბურავები და ბორბლები'),
 ('attach','მისაბმელები და აქსესუარები'),
 ('tools','ხელსაწყოები და სახელოსნო'),
]
def classify(n):
    s=n.lower()
    if 'კვადროციკლ' in s: return 'atv'
    if re.match(r'^(საბურავ|ლითონის საბურავ|საბურავის)',s): return 'tire'
    if re.search(r'შემასხურებ|შესასხურებ',s): return 'spray'
    if 'მისაბმელ' in s or re.search(r'^(გუთანი|საკვალი|მიწის სათოხნი|კარტოფილის ამოსაღები)',s): return 'attach'
    if re.search(r'კულტივატორის ძრავი|ბენზინის ძრავი|გენერატორ',s): return 'power'
    if 'ბურღ' in s: return 'drill'
    if 'საწველ' in s: return 'milk'
    if re.search(r'სათიბ|საკრეჭ|მულჩერ|გაზონ|ძუა',s) and 'საქუცმაცებ' not in s and 'წისქვილი' not in s: return 'mow'
    if re.search(r'საფქვავ|საფშვნელ|წისქვილ|საქუცმაცებ|წვენის|კაკლის|თხილის|ფურაჟ|ბალახის დასამუშავებელი',s): return 'mill'
    if re.search(r'შემასხურებ|შესასხურებ|სარწყავ|ტუმბო',s): return 'spray'
    if re.search(r'ხერხ',s): return 'saw'
    if re.search(r'მოტობლოკ|კულტივატორ|ჰირომიკი|ბუფალო|ამური|agri \d|agri 6000|ნიადაგის დასამუშავებელი|ფირტინა',s): return 'moto'
    return 'tools'

BR = [(r'ჰირომიკ|hiromiki','Hiromiki'),(r'ბუფალო|buffalo','Buffalo'),(r'ამური|amur','AMUR'),(r'\bagri\b','AGRI'),
      (r'pandora|პანდორა','Pandora'),(r'maybach','Maybach'),(r'royal partner|როიალ პარტნიორ|partner','Royal Partner'),
      (r'barbaros|ბარბაროს','Barbaros'),(r'fixtop|\bft\d','Fixtop'),(r'winstar|winsstar','Winstar'),(r'senci','SENCI'),
      (r'hoteche','Hoteche'),(r'dragon','Dragon'),(r'farmate|ფარმატე','Farmate'),(r'firtina|ფირტინა','Firtina')]
FIX = {'Winsstar':'Winstar','GSFixtop':'Fixtop'}
def brand(p):
    bs=[FIX.get(b,b) for b in p['b']]
    if len(bs)==1: return bs[0]
    s=p['n'].lower()
    for rx,b in BR:
        if re.search(rx,s): return b
    return bs[0] if bs else None

KEYS = """ბრენდი|მოდელი|მოდელის ნომერი|პროდუქტის მოდელი|ძრავის მოდელი|ძრავის ტიპი|ძრავის მოცულობა|ძრავის სიჩქარე|ძრავის სისტემა|ძრავი|სიმძლავრე|მაქსიმალური სიმძლავრე|ნომინალური სიმძლავრე|საწვავის ტიპი|საწვავი|საწვავის ტევადობა|საწვავის ავზის ტევადობა|საწვავის ავზის მოცულობა|ავზის მოცულობა|ზეთის ავზის მოცულობა|გადაცემათა კოლოფი|დამუშავების სიგანე|დამუშავების სიღრმე|დამუშავების სიგრძე|სამუშაო სიღრმე|საბურავის ზომა|საბურავების ზომა|წონა|მთლიანი წონა|დამატებითი აქსესუარები|განსაკუთრებული მახასიათებელი|გამორჩეული მახასიათებელი|გამოშვების წელი|გამოშვების თარიღი|დამზადების თარიღი|მწარმოებელი ქვეყანა|მწარმოებელი|გარანტია|ID|ზომა|მასალა|მოცულობა|ძაბვა|სიხშირე|მაქსიმალური სიჩქარე|მაქსიმალური დატვირთვა|ტიპი|ტრანსმისიის ტიპი|სტარტერი|აკუმულატორი|მუხრუჭი|დიამეტრი|შიდა გულის დიამეტრი|შეფუთვა|შეფუთვის ზომა|სეზონი|ფერი|რეზინის შემცველობა|ჩამრთველი|თავსებადობა|საქონლის კოდი|სერიული ნომერი|კოდი|პარამეტრები|მართვა|მინიმალური სიმაღლე|მაქსიმალური სიმაღლე|აწევის სიმაღლე|დანიშნულება|სიგანე|სიჩქარე|ბრუნვის სიჩქარე|ნედლეულის შემტანი პირის ზომა|რეგულირებადი სიმაღლე|მწარმოებლურობა|სიმაღლე|სიგრძე|ტევადობა|წნევა|ფრეზის რაოდენობა|ჭრის სიგანე|ჭრის სიმაღლე|ბატარეა|დამუხტვის დრო|ტაქტი|ცილინდრი""".split('|')
KEYS=sorted(set(KEYS),key=len,reverse=True)
KRX=re.compile(r'(?:(?<=\s)|^)('+'|'.join(map(re.escape,KEYS))+r')\s*:')
HIDE={'ID','საქონლის კოდი','სერიული ნომერი','კოდი','მოდელის ნომერი'}
def specs(sd):
    ms=list(KRX.finditer(sd)); out=[]
    for i,m in enumerate(ms):
        v=sd[m.end(): ms[i+1].start() if i+1<len(ms) else len(sd)].strip(' .;,')
        k=m.group(1)
        if k in HIDE or not v or len(v)>140: continue
        out.append([k,v])
    return out[:14]

def hp(p,sp):
    for src in [p['n']]+[v for k,v in sp if 'სიმძლავრე' in k]:
        m=re.search(r'(\d+(?:[.,]\d+)?)\s*(?:ცხ\.?\s*ძ|ცხენის\s*ძალ|ცხენისძალ|HP|hp)',src)
        if m: return float(m.group(1).replace(',','.'))
    m=re.search(r'\((\d+)\s*HP\)',p['n'])
    return float(m.group(1)) if m else None
def fuel(p,sp):
    t=(p['n']+' '+' '.join(v for k,v in sp if 'საწვავ' in k)).lower()
    if 'დიზელ' in t: return 'დიზელი'
    if 'ბენზინ' in t: return 'ბენზინი'
    if re.search(r'ელექტრო|220v|ბატარეა',t): return 'ელექტრო'
    return None
def axle(n):
    if 'მსხვილღერძ' in n: return 'მსხვილღერძიანი'
    if 'წვრილღერძ' in n: return 'წვრილღერძიანი'
    return None
def clean_name(n):
    n=re.sub(r'\s+',' ',n).strip()
    n=re.sub(r'ცხ\.\s*ძ\.?','ცხ.ძ.',n)
    n=re.sub(r'\b(\d{3})f\b',lambda m:m.group(1)+'F',n)
    n=n.replace('25CC25CC','25CC').replace('Winstar','Winstar')
    return n

norm=lambda s:re.sub(r'[^a-z0-9ა-ჰ]','',s.lower())
namecount=collections.Counter(norm(p['n']) for p in P)
imgcount=collections.Counter(p['img'][0] for p in P if p['img'])
have_img=set(int(f.split('.')[0]) for f in os.listdir(os.path.join(os.path.dirname(SRC),'images')))

items=[]; xray=[]
for p in P:
    sp=specs(p['sd']); c=classify(p['n'])
    issues=[]
    if not p['c']: issues.append('nocat')
    elif p['c']==['სხვადასხვა'] or 'სხვადასხვა' in p['c']: issues.append('misc')
    if not p['b']: issues.append('nobrand')
    if not p['sd'] and not p['d']: issues.append('nodesc')
    if namecount[norm(p['n'])]>1: issues.append('dup')
    if re.match(r'^ტესტ',p['n']): issues.append('test')
    if p['p']==0: issues.append('zero')
    if p['img'] and imgcount[p['img'][0]]>1: issues.append('sharedimg')
    desc=p['d'] or p['sd']
    desc=re.sub(r'შეძენა შესაძლებელია.*$','',desc).strip()
    it=dict(id=p['id'],n=clean_name(p['n']),p=p['p'],c=c,b=brand(p),hp=hp(p,sp),f=fuel(p,sp),ax=axle(p['n']),
            s=sp,d=desc[:420],st=p['st'],u=p['u'],im=p['id'] in have_img,t='test' in issues)
    items.append(it)
    xray.append([p['id'],[k for k,_ in CATS].index(c),issues, 1 if p['id'] in have_img else 0])

stats=dict(total=len(P),
  nocat=sum('nocat' in x[2] for x in xray), misc=sum('misc' in x[2] for x in xray),
  nobrand=sum('nobrand' in x[2] for x in xray), nodesc=sum('nodesc' in x[2] for x in xray),
  nofull=sum(1 for p in P if not p['d']),
  dup=sum('dup' in x[2] for x in xray), dupgroups=sum(1 for v in namecount.values() if v>1),
  test=sum('test' in x[2] for x in xray), zero=sum('zero' in x[2] for x in xray),
  sharedimg=sum('sharedimg' in x[2] for x in xray), oos=sum(1 for p in P if not p['st']),
  motoUncat=sum(1 for p,x in zip(P,xray) if x[1]==0 and 'nocat' in x[2]), moto=sum(1 for x in xray if x[1]==0),
  fetchedAt=d['fetchedAt'])
stats['catCounts']={k:sum(1 for x in xray if x[1]==i) for i,(k,_) in enumerate(CATS)}
os.makedirs(OUT,exist_ok=True)
json.dump(dict(cats=CATS,items=[i for i in items if not i['t']],fetchedAt=d['fetchedAt']),open(os.path.join(OUT,'catalog.json'),'w'),ensure_ascii=False,separators=(',',':'))
json.dump(dict(cats=CATS,xray=xray,stats=stats),open(os.path.join(OUT,'xray.json'),'w'),ensure_ascii=False,separators=(',',':'))
print(json.dumps(stats,ensure_ascii=False,indent=1))
for k,n in CATS:
    print(k, [i['n'] for i in items if i['c']==k][:40])
