$(document).ready(
            function() {
                addPlot();
                addSlicePlot();
                addConnectome();
                addRConnectome();
                addFConnectome();
                addBConnectome();
                $("#select-view").change(surfaceRelayout);
                $("#connectome-plot").mouseup(function() {
                    $("#select-view").val("custom");
                });
                $("#brain-right").mouseup(RSurfaceRelayout);
                $("#brain-front").mouseup(FSurfaceRelayout);
                $("#brain-back").mouseup(BSurfaceRelayout);
                $(window).resize(surfaceRelayout);
                $("#opacity-range").change(updateOpacity);

            });