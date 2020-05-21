const {getTocChildren,SEGSEP,LEVELSEP}=require("dengine")

const MAXLINE=256,MAXPAGE=32768;
const vplval=id=>{
	const p=id.split(SEGSEP);
	const vol=parseInt(p[0]);
	const page=parseInt(p[1]);
	let line=0;
	if (!p[1])return 0;
	let at=p[1].indexOf(LEVELSEP)
	if (at>-1) {
		line=parseInt(p[1].substr(at+1));
	}

	return line+page*MAXLINE+vol*MAXPAGE*MAXLINE;

}
const closestItem=(toc,tocitems,vpl)=> {
	const v=vplval(vpl)+5;//10 more line, to show deeper toc
	for (let i=1;i<tocitems.length;i++) {
		const tv=vplval(toc[tocitems[i]].l);
		if (tv>v) return i-1;
	}
	return tocitems.length-1;
}
const renderCrumb=(toc,vpl)=>{
	if (!toc)return [];
	let cur=0,out=[],level=0,dropdowns=[];
	const vplv=vplval(vpl); 
	let children=getTocChildren(toc,cur),nextchildren;
	do {
		let selected = closestItem(toc,children,vpl) ;
		cur=children[selected];
	
		let items=children.map(child=>{
			let t=toc[child].t, l=toc[child].l;
			return {l,t:t,idx:child};
		});

		nextchildren=getTocChildren(toc,cur);
		if (items.length && (dropdowns.length==0||vplv>=vplval(items[0].l) )) {
			dropdowns.push({level:level,items:items,selected:selected,nextchildren:nextchildren});
		} else break;

		level++;
		if (!nextchildren.length) break;
		children=nextchildren;
	} while (true);
	return dropdowns;
}


module.exports=Vue.component('breadcrumbtoc', { 
	props:{
		'vpl':{type:String,required:true}
		,'gettoc':{type:Function}
		,'selectsid':{type:Function,required:true}
	},
	methods:{
		onselect(event){
			this.selectsid(event.target.selectedOptions[0].value);
		}
	},
	render  (h) { 
		let dropdowns=[];
		if (this.gettoc) dropdowns=renderCrumb(this.gettoc(),this.vpl);	
		let selects=[];
		let self=this;
		for (let i=0;i<dropdowns.length;i++){
			let options=[];
			let items=dropdowns[i].items;
			let selected=dropdowns[i].selected;
			
			for (let j=0;j<items.length;j++){
				let attrs={value:items[j].l};
				options.push( h('option',{attrs}, items[j].t ) );
			}
			selects.push( h('select',{
				on:{input:this.onselect },
				domProps:{selectedIndex:selected},
			 class: 'breadcrumbtoc'}, options) );
			
		}
		return h('span',{},selects) 
	}

})

/*
createElement( // {String | Object | Function} 'div', 
// in this case a string {
 'class': ... 
 style: ... 
 attrs: ... 
 props: ... 
 domProps: ... 
 on: { click: ... input: ... ... },
 nativeOn: { input: ... ...},
directives: ... 
slot: ... 
key: ... 
ref: ... },
[ ... an array of children ... ] )
*/