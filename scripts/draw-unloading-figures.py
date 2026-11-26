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

fig = base(1, 'A complete pneumatic unloading system', 'Four connected systems. One compatible installation.')
ax = fig.add_axes([.055, .22, .89, .53]); ax.set(xlim=(0, 1100), ylim=(0, 430)); ax.axis('off')
def box(x, y, w, h, fill, edge=GREEN, radius=7):
    p = FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0,rounding_size={radius}', fc=fill, ec=edge, lw=2); ax.add_patch(p)
def line(points, color=GREEN, width=3, **kw):
    ax.plot(*zip(*points), color=color, lw=width, solid_capstyle='round', **kw)
def label(x, y, value, size=12, **kw):
    ax.text(x, y, value, color=INK, fontsize=size, ha='center', va='center', linespacing=1.5, **kw)
# Compressor and motor, tank and independent receiving silo are deliberately conceptual.
box(10, 135, 170, 90, '#d6dfce'); box(30, 158, 52, 44, GREEN)
for x in [102, 119, 136]: line([(x, 151), (x, 206)], '#637d60', 2)
line([(0, 130), (193, 130)], GREEN, 4)
box(315, 170, 340, 128, '#d6dfce', radius=40)
ax.add_patch(Polygon([(342,170),(402,106),(452,170)],fc='#d6dfce',ec=GREEN,lw=2))
ax.add_patch(Polygon([(515,170),(574,106),(624,170)],fc='#d6dfce',ec=GREEN,lw=2))
line([(318,100),(655,100)], GREEN, 4)
for x in [365, 570, 624]: ax.add_patch(Circle((x, 77), 21, fc=GREEN)); ax.add_patch(Circle((x,77),8,fc=PAPER))
box(410, 298, 75, 13, GREEN, radius=3)
line([(180,180),(235,180),(235,329),(383,329),(383,295)], GREEN, 4)
line([(235,180),(235,115),(400,115)], GREEN, 3)
line([(235,115),(574,115)], GREEN, 3)
for x in [400,574]: ax.add_patch(Circle((x,130),9,fc=LIME,ec=GREEN,lw=1))
label(267, 357, 'Air supply', 11)
# Route uses a smooth hose curve; no decorative arrows or operational valve instructions.
vertices=[(574,106),(735,100),(740,25),(800,38),(850,50),(848,320),(923,320)]
codes=[Curve.MOVETO,Curve.CURVE4,Curve.CURVE4,Curve.CURVE4,Curve.CURVE4,Curve.CURVE4,Curve.CURVE4]
ax.add_patch(PathPatch(Curve(vertices,codes),ec=LIME,lw=7,fill=False,capstyle='round'))
box(923, 130, 145, 210, '#d6dfce', radius=4)
ax.add_patch(Polygon([(923,130),(995,67),(1068,130)],fc='#d6dfce',ec=GREEN,lw=2))
line([(943,109),(933,37)], GREEN, 3); line([(1046,109),(1056,37)],GREEN,3)
box(970, 340, 44, 46, GREEN, radius=3)
line([(1031,340),(1031,374)],GREEN,2)
label(983, 415, 'Ventilation & protection', 11)
label(995, 244, 'RECEIVING\nSILO', 13, weight='bold')
label(485, 240, 'TANKER VESSEL', 14, weight='bold')
label(682, 27, 'Discharge pipeline', 11)
label(485, 200, 'Air distribution', 10)
for x,n,t in [(90,'01','Compressor'),(480,'02','Tanker vessel'),(765,'03','Discharge line'),(995,'04','Receiving silo')]:
    ax.text(x,-31,n,color='#628700',fontsize=12,weight='bold',ha='center')
    ax.text(x,-58,t,color=INK,fontsize=12,ha='center',weight='bold')
save(fig,'pneumatic-unloading-system','Conceptual illustration · Not to scale · Not an operating or installation drawing\nEquipment ratings, ventilation and protection require project-specific verification.')

fig = base(2, 'Discharge rate and vehicle turnaround', 'Scenario: 25-tonne payload + 15 minutes of additional handling')
ax = fig.add_axes([.12,.22,.80,.51], facecolor=PAPER)
rates=[25,40,60,80]; transfer=[60,37.5,25,18.75]; totals=[75,52.5,40,33.75]
ax.bar(range(4),transfer,color=GREEN,width=.48,label='Material transfer')
ax.bar(range(4),[15]*4,bottom=transfer,color=LIME,width=.48,label='Additional handling')
for i,total in enumerate(totals): ax.text(i,total+2,f'{total:g} min',ha='center',color=INK,fontsize=16,weight='bold')
ax.set_xticks(range(4),[f'{r} t/h' for r in rates]); ax.set_ylim(0,88)
ax.set_ylabel('Total turnaround (minutes)',color=INK,labelpad=12)
ax.set_xlabel('Assumed average material discharge rate',color=INK,labelpad=15)
ax.spines[['top','right','left']].set_visible(False);ax.spines['bottom'].set_color('#aabca0')
ax.tick_params(length=0,colors=MUTED,pad=10);ax.set_axisbelow(True);ax.grid(axis='y',color='#d7dece',linewidth=.8)
fig.legend(*ax.get_legend_handles_labels(),loc='upper right',bbox_to_anchor=(.94,.80),frameon=False,ncol=2,fontsize=11)
save(fig,'discharge-rate-turnaround','Total turnaround = payload ÷ discharge rate × 60 + additional handling\nMathematical scenarios only · Actual discharge performance requires a project-specific assessment.')

fig=base(3,'What 30 minutes can mean across a fleet','Scenario: 5 vehicles × 300 annual deliveries per vehicle = 1,500 deliveries')
ax=fig.add_axes([.22,.28,.70,.38],facecolor=PAPER)
ax.barh([1,0],[1875,1125],color=[GREEN,'#688769'],height=.48)
ax.barh([0],[750],left=[1125],color=LIME,height=.48)
ax.set_yticks([1,0],['75 min\nCurrent','45 min\nTarget']);ax.set_xlim(0,2200)
ax.set_xlabel('Annual vehicle-hours occupied by turnaround',color=INK,labelpad=15)
ax.spines[['top','right','left']].set_visible(False);ax.spines['bottom'].set_color('#aabca0')
ax.tick_params(length=0,colors=MUTED,pad=12);ax.set_axisbelow(True);ax.grid(axis='x',color='#d7dece',lw=.8)
ax.text(1875+35,1,'1,875 h',va='center',color=INK,fontsize=16,weight='bold')
ax.text(560,0,'1,125 h',va='center',ha='center',color='white',fontsize=16,weight='bold')
ax.text(1500,0,'750 h\nreleased',va='center',ha='center',color=GREEN,fontsize=16,weight='bold')
fig.text(.055,.73,'750',color=GREEN,fontsize=45,weight='bold')
fig.text(.225,.738,'VEHICLE-HOURS RELEASED PER YEAR',color=INK,fontsize=15,weight='bold')
save(fig,'annual-fleet-time','Time released = vehicles × annual deliveries per vehicle × minutes released per delivery ÷ 60\nIllustrative scenario · Released time and economic value do not automatically become cash savings.')
print(f'Wrote three original figures (SVG + 2400 × 1600 PNG) to {OUT}')
