"""Original editorial figures. Run with matplotlib; no manufacturer artwork is reused."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
from matplotlib.patches import Rectangle, FancyBboxPatch, Circle, Polygon, PathPatch
from matplotlib.path import Path as Curve

OUT = Path(__file__).resolve().parents[1] / 'public/images/guides'
OUT.mkdir(parents=True, exist_ok=True)
GREEN, LIME, INK, MUTED, PAPER = '#0a3424', '#9bc900', '#153c2b', '#526653', '#f0f1e9'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 15, 'svg.fonttype': 'none'})

def base(number, title, subtitle):
    fig = plt.figure(figsize=(12, 8), facecolor=PAPER)
    fig.text(.055, .94, f'TECHNICSAN  /  ENGINEERING SERIES  /  FIGURE {number:02d}', fontsize=10, color=MUTED, weight='bold')
    fig.text(.055, .875, title, fontsize=22, color=INK, weight='bold')
    fig.text(.055, .829, subtitle, fontsize=12, color=MUTED)
    fig.add_artist(plt.Line2D([.055, .945], [.79, .79], color='#bdc9b4', lw=1))
    return fig

def save(fig, name, footer):
    fig.text(.055, .045, footer, fontsize=10, color=MUTED, linespacing=1.6)
    for fmt in ['svg', 'png']:
        fig.savefig(OUT / f'{name}.{fmt}', dpi=200, facecolor=PAPER)
    Image.open(OUT / f'{name}.png').convert('RGB').save(OUT / f'{name}.webp', quality=90)
    plt.close(fig)

def tidy(ax, axis='x'):
    ax.spines[['top','right','left']].set_visible(False)
    ax.spines['bottom'].set_color('#aabca0')
    ax.tick_params(length=0,colors=MUTED,pad=10)
    ax.set_axisbelow(True)
    ax.grid(axis=axis,color='#d7dece',linewidth=.8)

fig=base(1,'Nominal volume is not usable inventory','Scenario: 80 m³ × 1.20 t/m³ · 90% assumed fill · 4 t unavailable allowance')
ax=fig.add_axes([.28,.31,.60,.41],facecolor=PAPER)
ax.barh([2,1,0],[96,86.4,82.4],color=['#8fa28a',GREEN,LIME],height=.48)
ax.set_yticks([2,1,0],['Full geometric\nvolume basis','At assumed\nfilling fraction','Estimated usable\ninventory'])
ax.set_xlim(0,110);ax.set_xticks([0,20,40,60,80,100])
ax.set_xlabel('Calculated material mass (tonnes)',color=INK,labelpad=15)
for y,value in [(2,96),(1,86.4),(0,82.4)]:ax.text(value+2,y,f'{value:g} t',color=INK,va='center',fontsize=16,weight='bold')
tidy(ax)
fig.text(.055,.16,'96 × 0.90 = 86.4 t',fontsize=16,color=INK,weight='bold')
fig.text(.48,.16,'86.4 − 4 = 82.4 t usable',fontsize=16,color=INK,weight='bold')
save(fig,'silo-usable-inventory','Illustrative volume calculation · 90% is not a universal safe filling recommendation\nApproved fill level, permissible stored mass and structural limits require separate verification.')

fig=base(2,'Plan for demand and the delivery','Conservative scenario: a complete tanker arrives at the reorder point')
ax=fig.add_axes([.075,.43,.85,.25],facecolor=PAPER)
ax.barh([0],[16],color='#6b8661',height=.48)
ax.barh([0],[32],left=[16],color=GREEN,height=.48)
ax.barh([0],[28],left=[48],color=LIME,height=.48)
ax.set_xlim(0,80);ax.set_ylim(-.5,.5);ax.set_yticks([])
ax.set_xticks([0,16,32,48,64,76]);ax.set_xlabel('Working inventory target (tonnes)',color=INK,labelpad=15)
for x,t,c in [(8,'16 t\nReserve','white'),(32,'32 t\nLead-time demand','white'),(62,'28 t\nFull delivery',GREEN)]:ax.text(x,0,t,ha='center',va='center',fontsize=13,weight='bold',color=c,linespacing=1.6)
tidy(ax)
for x,big,small in [(.075,'48 t','Reorder point'),(.38,'76 t','Working inventory\ntarget'),(.70,'74.1 m³','Nominal volume\nrequired')]:
    fig.text(x,.255,big,fontsize=29,weight='bold',color=GREEN)
    fig.text(x,.21,small,fontsize=11,color=MUTED)
fig.text(.075,.145,'32 t/day · 1-day lead time · 0.5-day reserve · 28 t delivery',fontsize=12,color=INK)
save(fig,'silo-demand-delivery','Nominal volume = (76 t target + 4 t unavailable) ÷ (1.20 t/m³ × 0.90)\nIllustrative planning only · Verify actual receiving capacity before every delivery.')

fig=base(3,'Bulk density changes the inventory','Scenario: 80 m³ nominal volume · 90% assumed fill · 4 t unavailable allowance')
ax=fig.add_axes([.12,.23,.79,.50],facecolor=PAPER)
densities=[1.0,1.1,1.2,1.3,1.4];inventories=[68,75.2,82.4,89.6,96.8]
ax.bar(range(5),inventories,color=[GREEN,GREEN,LIME,GREEN,GREEN],width=.5)
for i,value in enumerate(inventories):ax.text(i,value+2,f'{value:g} t',ha='center',fontsize=15,color=INK,weight='bold')
ax.set_xticks(range(5),[f'{value:.2f}' for value in densities]);ax.set_ylim(0,112)
ax.set_ylabel('Estimated usable inventory (tonnes)',color=INK,labelpad=13)
ax.set_xlabel('Hypothetical bulk density (t/m³)',color=INK,labelpad=15)
tidy(ax,'y')
save(fig,'silo-density-sensitivity','Usable inventory = nominal volume × bulk density × assumed fill fraction − unavailable allowance\nHypothetical densities · Volume needs and structural loading must both be assessed.')
print('Wrote three original silo figures in SVG, PNG and WebP formats.')

