import re
H='#004D36'
def load(n):
    s=open(f'icons-src/{n}.svg').read(); return re.sub(r'<\?xml[^>]*>\s*','',s)
def paint(n, fills, out, pre=''):
    s=load(n); ms=list(re.finditer(r'<(path|rect|polygon|ellipse|circle)\b[^>]*?/?>', s)); res=[]; last=0
    for i,m in enumerate(ms):
        tag=m.group(0); white='cls-1' in tag; tag=re.sub(r'\s*class="cls-1"','',tag)
        f=fills.get(i, fills.get('white','#FFFFFF') if white else fills.get('black', '#020202'))
        tag=tag.replace('<'+m.group(1)+' ', f'<{m.group(1)} fill="{f}" ',1)
        res.append(s[last:m.start()]); res.append(tag); last=m.end()
    res.append(s[last:]); s=''.join(res)
    s=re.sub(r'<defs>[\s\S]*?</defs>','',s)
    if pre: s=s.replace('<g id=', pre+'<g id=',1)
    s=s.replace('id="Layer_2" data-name="Layer 2" ', f'id="ic-{out}" ')
    open(f'icons/{out}.svg','w').write(s)
paint('Bitcoin', {0:'#A2A524',1:H}, 'bitcoin', pre='<circle cx="204.3" cy="204.5" r="172" fill="#EDFF00"/>')
paint('growth_chart_01', {'black':H,1:'#10A867',5:'#10A867',6:'#4CBE8D',7:'#93D8BB',8:'#B7E5D1'}, 'chart')
paint('small_amount_of_coins', {'black':H,'white':'#10A867',1:'#00E677',2:'#00E677',3:'#00E677'}, 'coins')
paint('calendar', {'black':'#10A867',0:H,2:H,3:H}, 'calendar')
paint('target_01', {'black':H,'white':'#00E677'}, 'target')
paint('coffee_01', {'black':H,1:'#E4CFB6',2:'#FFFFFF',3:'#FFFFFF',4:'#FFFFFF',5:'#FFFFFF',6:H,7:'#E4CFB6',8:'#E4CFB6'}, 'coffee')
# small amount: one coin, brand greens
paint('one_coin', {'black':H,'white':'#10A867',1:'#00E677'}, 'onecoin')
# stacks: lime for Bitcoin, greens for the formula result (tops are indices 19-23)
tops = {i:'#EDFF00' for i in range(7,12)}
paint('stacks_of_coins', {'black':H,'white':'#C1DB3C', **tops}, 'stacks-lime')
tops = {i:'#00E677' for i in range(7,12)}
paint('stacks_of_coins', {'black':H,'white':'#10A867', **tops}, 'stacks-green')
# growth plant for the dark takeaway card
paint('growth_plant', {'black':'#FFFFFF',1:'#E4CFB6',2:'#00E677',3:'#00E677',4:'#BAA38B'}, 'plant')
