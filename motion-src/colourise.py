import re, json, sys
C = {
 'skin':'#B86A4F','mouth':'#5E2219','teeth':'#FFFFFF',
 'jacket':'#006341','lapel':'#004D36','trousers':'#003A29',
 'shirt':'#FFFFFF','collar':'#FFFFFF','cuff':'#FFFFFF','tie':'#00E677',
 'shoe':'#D9E4E1','sole':'#10A867','buckle':'#8CAFA4',
 'cup':'#FFFFFF','lid':'#004D36','lidtop':'#006341',
 'laptop':'#D9E4E1','laptopbase':'#B3CAC3','laptopbase2':'#FFFFFF','keys':'#8CAFA4',
 'desk':'#B3CAC3','deskleg':'#8CAFA4',
 'chair':'#10A867','chairside':'#006341','post':'#8CAFA4','wheel':'#004D36',
 'coinring':'#10A867','coin':'#00E677','coinB':'#FFFFFF',
}
M = {
 'P03': {'jacket':[0,3,21,18],'trousers':[1,2],'skin':[4,12,9,15,27,29,31,33],'shirt':[5],'tie':[7,26],'shoe':[6,8],'sole':[13,14],
         'cup':[10],'lid':[20],'lidtop':[22],'lapel':[11,16,19],'collar':[17,32],'cuff':[23,24],'buckle':[25],'mouth':[28],'teeth':[30]},
 'P04': {'trousers':[0],'jacket':[1,2,19],'skin':[3,8,10,14],'shirt':[4],'tie':[5,21],'shoe':[6,9],'sole':[11,15],'lapel':[7,12,16],
         'collar':[13,24],'cuff':[17,18],'buckle':[20],'mouth':[22],'teeth':[23]},
 'P08': {'jacket':[0,3,16],'trousers':[1,2],'skin':[4,8,12,19,26,27,28,30],'shirt':[5,33],'tie':[6,25],'shoe':[7,9],'sole':[13,14],
         'cup':[10],'lid':[20],'lidtop':[22],'lapel':[11,15,18],'collar':[17,29],'cuff':[21,23],'buckle':[24],'mouth':[31],'teeth':[32]},
 'P06': {'laptop':[0],'laptopbase':[26],'keys':[30],'laptopbase2':[43],'trousers':[1,2,36],'jacket':[3,8,27,17],'desk':[5],'deskleg':[4],
         'chair':[6,9],'chairside':[10,33],'post':[19,32,13],'wheel':[29,31],'skin':[7,15,14,28],'shoe':[11,12],'sole':[20,22],
         'lapel':[16,23,24],'shirt':[21,39,41],'tie':[18,35],'collar':[25,40],'cuff':[34],'buckle':[38],'mouth':[37],'teeth':[42]},
 'P05': {'trousers':[0],'jacket':[1,2,4],'coinring':[3],'coin':[29,31,32],'coinB':[30],'skin':[5,11,6,12],'shoe':[7,10],'sole':[14,20],
         'shirt':[8,15,21],'tie':[13,18,25],'lapel':[9,16,19],'collar':[17,26],'cuff':[22,23],'buckle':[24],'mouth':[27],'teeth':[28]},
 'P01': {'trousers':[0],'jacket':[1,2,19],'shirt':[3],'tie':[6,21],'skin':[4,9,5,14],'shoe':[7,10],'sole':[11,15],'lapel':[8,12,16],
         'collar':[13,22],'cuff':[17,18],'buckle':[20],'mouth':[23],'teeth':[24]},
 'P09': {'trousers':[0],'jacket':[1,2,18],'skin':[3,8,10,17,24,25,27,14],'shirt':[4],'tie':[5,23],'shoe':[6,9],'sole':[11,16],
         'lapel':[7,12,15],'collar':[13,28],'cuff':[19,20],'buckle':[21],'mouth':[22],'teeth':[26]},
 'P02': {'trousers':[0],'jacket':[1,2,4,6,13],'skin':[3,9,19,20,29],'shoe':[5,7],'sole':[12,15],'shirt':[8,16,21,30],'tie':[11,17,24],
         'lapel':[10,14],'collar':[18,27],'cuff':[23,28],'buckle':[22],'mouth':[25],'teeth':[26]},
}
for pid, m in M.items():
    s = open(f'poses/{pid}.svg').read()
    s = re.sub(r'<\?xml[^>]*>\s*','',s); s = re.sub(r'<metadata>[\s\S]*?</metadata>','',s)
    idx2 = {}
    for role, ids in m.items():
        for i in ids:
            assert i not in idx2, (pid, i, role, idx2.get(i)); idx2[i] = C[role]
    k = [0]
    def rep(mo):
        i = k[0]; k[0] += 1
        return mo.group(0).replace('class="cls-1"', f'fill="{idx2[i]}"' if i in idx2 else 'class="cls-1"')
    s = re.sub(r'<(path|rect|polygon|ellipse|circle)\b[^>]*class="cls-1"[^>]*>', rep, s)
    missing = [i for i in range(k[0]) if i not in idx2]
    s = s.replace('id="Layer_2" data-name="Layer 2" ', f'id="{pid}" ')
    open(f'col/{pid}.svg','w').write(s)
    print(pid, 'regions', k[0], 'unmapped', missing)
