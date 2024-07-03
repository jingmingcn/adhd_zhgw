// Tell jslint that certain variables are global
/* global afqb, $ */

// Change the cursor type for the ew-resize lines
// And each time a panel is resized left-right (aka east-west), resize the threejs container
$('.ew-resize')
	.resizable({
		handles: "e",//可以调整的方位
		create: function () {
            "use strict";
            // Prefers another cursor with two arrows
			// Choose between "col-resize" and "ew-resize"
            $(".ui-resizable-e").css("cursor", "col-resize");//col-resize 有左右两个箭头，中间由竖线分隔开的光标。用于标示项目或标题栏可以被水平改变尺寸。
        },
		resize: function () {
            "use strict";
			// afqb.three.onWindowResize();
		}
	});

// Same as above but for north-south
$('.ns-resize')
	.resizable({
		handles: "s",
		create: function () {
            "use strict";
            // Prefers an another cursor with two arrows
			// Choose between "col-resize" and "ns-resize"
            $(".ui-resizable-s").css("cursor", "row-resize");
        },
		resize: function () {
            "use strict";
			// afqb.three.onWindowResize();
		}
	});
