$(document).ready(
            function() {
                addPlot();
                addConnectome();
                $("#select-view").change(surfaceRelayout);
                $("#connectome-plot").mouseup(function() {
                    $("#select-view").val("custom");
                });
                $(window).resize(surfaceRelayout);
                // $("#opacity-range").change(updateOpacity);
            });