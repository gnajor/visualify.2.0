export class DonutChart{
    constructor(parent, dataset, colors, width, height){
        this.parent = d3.select(parent);
        this.dataset = dataset;
        this.colors = colors;

        this.wSvg = width;
        this.hSvg = height;
        this.radius = Math.min(this.wSvg, this.hSvg) / 2;

        this.init();
    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .attr("width", "100%")
            .attr("height", "100%")
            .classed("donut-chart", true)

        this.prepScales();
        this.render();
    }

    prepScales(){
        this.pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        this.color = d3.scaleOrdinal()
            .domain(this.dataset.map(item => item.label))
            .range(this.colors)

        this.arc = d3.arc()
            .innerRadius(this.radius - 10)
            .outerRadius(this.radius)
    }

    render(){
        const group = this.svg.append("g");
        group.attr("transform", `translate(${this.wSvg / 2}, ${this.hSvg / 2})`)
            .selectAll("path")
            .data(this.pie(this.dataset))
            .enter()
                .append("path")
                .attr("fill", d => this.color(d.data.label))
                .attr("d", this.arc);
                
        group.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("transform", `translate(50%, 50%)`)
            .text(`${this.dataset[0].value}%`)
            .attr("fill", "white");
    }
}