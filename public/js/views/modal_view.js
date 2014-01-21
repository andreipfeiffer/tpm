App.ModalView = Em.View.extend({
    // the yeild is missing a pair of { }.
    // octpress likes to interpret them as liquid tags :(
    layout: Em.Handlebars.compile("{yield}<div class=modal-backdrop></div>"),

    didInsertElement: function() {
        App.animateModalOpen();
    }
});