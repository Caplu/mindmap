import React, {Component} from 'react';

import {events, selectionsManager} from '../managers';

import * as widgetGenerator from './widgetgenerator';

import * as EventTags from '../constants/EventTags';
import * as CommonConstant from '../constants/Common';


const AddChildTopicButton = widgetGenerator.buttonGenerator('Add Child Topic', 'onAddChildTopic');

const RemoveTopicButton = widgetGenerator.buttonGenerator('Remove Topic', 'onRemoveSelfTopic');

const UpdateFontSizeSelector = widgetGenerator.selectorGenerator('Font Size', 'onUpdateFontSize', {
  '8px': '8', '9px': '9', '10px': '10', '11px': '11', '12px': '12', '13px': '13', '14px': '14', '16px': '16',
  '18px': '18', '20px': '20', '22px': '22', '24px': '24', '36px': '36', '48px': '48', '56px': '56'
});

const UpdateFontColorPicker = widgetGenerator.colorPickerGenerator('Font Color', 'onUpdateFontColor');

const UpdateIsFontBoldCheckBox = widgetGenerator.checkBoxGenerator('Bold', 'onUpdateIsFontBold');

const UpdateIsFontItalicCheckBox = widgetGenerator.checkBoxGenerator('Italic', 'onUpdateIsFontItalic');

const UpdateIsFontLineThroughCheckBox = widgetGenerator.checkBoxGenerator('Line Through', 'onUpdateIsFontLineThrough');

const UpdateShapeClassSelector = widgetGenerator.selectorGenerator('Shape Class', 'onUpdateShapeClass', {
  [CommonConstant.SHAPE_RECT]: 'Rect',
  [CommonConstant.SHAPE_ROUNDED_RECT]: 'Rounded Rectangle',
  [CommonConstant.SHAPE_PARALLELOGRAM]: 'Parallelogram'
});

const UpdateLineClassSelector = widgetGenerator.selectorGenerator('Line Class', 'onUpdateLineClass', {
  [CommonConstant.LINE_NONE]: 'None',
  [CommonConstant.LINE_RIGHT_ANGLE]: 'Right Angle',
  [CommonConstant.LINE_ROUNDED]: 'Rounded'
});

const UpdateFillColorPicker = widgetGenerator.colorPickerGenerator('Fill Color', 'onUpdateFillColor');

const UpdateLabelTextInput = widgetGenerator.textInputGenerator('Label Text', 'onUpdateLabel');

class TopicEditPanel extends Component {
  constructor() {
    super();

    this.state = {
      show: false,
      remBtnDisabled: false,

      fontSize: '',
      fontColor: '',
      isFontBold: '',
      isFontItalic: '',
      isFontLineThrough: '',

      fillColor: '',
      shapeClass: '',
      lineClass: '',
      labelText: ''
    }
  }

  render() {

    const panelProps = {
      className: 'topic-edit-panel',
      style: {
        display: this.state.show ? 'block' : 'none'
      }
    };

    const updateLabelProps = {
      value: this.state.labelText,
      onChange: e => this.setState({labelText: e.target.value}),
      onBlur: e => this.dispatchOperator(e),
      onKeyDown: e => {
        const which = e.which;
        which === 13 && this.dispatchOperator(e);
      }
    };
    
    const removeTopicProps = {
      onClick: e => this.dispatchOperator(e, null, selectionsManager.getSelectionsArrayWithoutChild()),
      disabled: this.state.remBtnDisabled
    };
    
    return (
      <div { ...panelProps } >
        <AddChildTopicButton onClick={e => this.dispatchOperator(e)}/>
        <RemoveTopicButton {...removeTopicProps}/>
        <hr/>
        <UpdateFontSizeSelector {...this.generateNormalProps('fontSize')}/>
        <UpdateFontColorPicker {...this.generateNormalProps('fontColor')}/>
        <UpdateIsFontBoldCheckBox {...this.generateCheckBoxProps('isFontBold')}/>
        <UpdateIsFontItalicCheckBox {...this.generateCheckBoxProps('isFontItalic')}/>
        <UpdateIsFontLineThroughCheckBox {...this.generateCheckBoxProps('isFontLineThrough')}/>
        <hr/>
        <UpdateShapeClassSelector {...this.generateNormalProps('shapeClass')}/>
        <UpdateLineClassSelector {...this.generateNormalProps('lineClass')}/>
        <UpdateFillColorPicker {...this.generateNormalProps('fillColor')}/>
        <hr/>
        <UpdateLabelTextInput {...updateLabelProps}/>
      </div>
    );
  }

  generateNormalProps(stateKey) {
    return {
      value: this.state[stateKey],
      onChange: e => this.dispatchOperator(e, stateKey)
    };
  }
  
  generateCheckBoxProps(stateKey) {
    return {
      checked: this.state[stateKey],
      onClick: e => {
        const widgetId = e.target.id;
        const checked = e.target.checked;

        selectionsManager.getSelectionsArray().forEach((component) => {
          component[widgetId](checked);
        });

        this.setState({
          [stateKey]: checked
        });
      }
    }
  }
  
  dispatchOperator(e, syncValue, operatorTargetArray = selectionsManager.getSelectionsArray()) {
    const widgetId = e.target.id;
    const widgetValue = e.target.value;

    operatorTargetArray.forEach((component) => {
      component[widgetId](widgetValue);
    });

    if (syncValue) {
      this.setState({
        [syncValue]: widgetValue
      });
    }
  }

  setPanelWidgetValue(topicInfo) {
    let remBtnDisabled; {
      const selections = selectionsManager.getSelectionsArray();
      if (selections.length === 1 && selections[0].props.topicInfo.type === CommonConstant.TOPIC_ROOT) {
        remBtnDisabled = true;
      }
    }

    const topicStyle = topicInfo.style;

    this.setState({
      fontSize: topicStyle.fontSize,
      fontColor: topicStyle.fontColor,
      isFontBold: !!topicStyle.isFontBold,
      isFontItalic: !!topicStyle.isFontItalic,
      isFontLineThrough: !!topicStyle.isFontLineThrough,
      
      fillColor: topicStyle.fillColor,
      labelText: topicInfo.label || '',
      shapeClass: topicStyle.shapeClass,
      lineClass: topicStyle.lineClass,
      remBtnDisabled
    });
  }

  componentDidMount() {
    events.on(EventTags.TOPIC_SELECTED, (topicInfo) => {
      this.setState({show: true});
      this.setPanelWidgetValue(topicInfo);
    });
    
    events.on(EventTags.TOPIC_DESELECTED, () => {
      this.setState({show: false});
    });
    
    events.on(EventTags.UNDO_OR_REDO_TRIGGERED, () => {
      if (!this.state.show) return;

      const selections = selectionsManager.getSelectionsArray();
      this.setPanelWidgetValue(selections[selections.length - 1].props.topicInfo);
    });
  }
}

export default TopicEditPanel;