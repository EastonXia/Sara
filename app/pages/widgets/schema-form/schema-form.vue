<template>
  <el-row v-if="schema && schema.properties" class="schema-form">
    <template v-for="(itemSchema, key) in schema.properties">
      <component 
        :is="FormItemConfig[itemSchema.option?.comType]?.component"
        v-show="itemSchema.option.visible !== false"
        ref="formComList"
        :schema-key="key"
        :schema="itemSchema"
        :model="model ? model[key] : undefined"
      />
    </template>
  </el-row>
</template>

<script setup>
import { ref, toRefs, provide } from 'vue';
import FormItemConfig from './form-item-config';

const Ajv = require('ajv');
const ajv = new Ajv();
provide('ajv', ajv);

const props = defineProps({
  /**
   * schema 配置结构如下
   * { // 板块数据结构
        type: 'object',
        properties: {
          key: {
            ...schema, // 标准 schema 配置
            type: '', // 字段类型
            label: '', // 字段的中文名
            option: {
              ...eleComponentConfig, // 标准 el-component 配置
              comType: '', // 控件类型 input/select/input-number
              required: false, // 表单数据是否必填，默认为 false
              visible: true, // 是否展示，默认为 true
              disabled: false, // 是否禁用，默认为 false
              default: '', // 默认值

              // comType === 'select' 时生效
              enumList: [] // 枚举列表
            },
          }
        },
      }
   */
  schema: Object,

  // 表单数据
  model: Object,
});
const { schema, model } = toRefs(props);

const formComList = ref([])

// 表单校验
const validate = () => {
  return formComList.value.every(component => component.validate())
}

// 获取表单值
const getValue = () => {
  let dtoObj = {};

  formComList.value.forEach((component) => {
    dtoObj = {
      ...dtoObj,
      ...component.getValue()
    }
  })

  return dtoObj;
}

defineExpose({
  validate,
  getValue
})
</script> 

<style lang="less">
.schema-form {
  .form-item {
    margin-bottom: 20px;
    min-width: 500px;

    .item-label {
      margin-right: 15px;
      min-width: 70px;
      text-align: right;
      font-size: 14px;
      color: #fff;
      word-break: break-all;

      .required {
        top: 2px;
        padding-left: 4px;
        color: #f56c6c;
        font-size: 20px;
      }
    }

    .item-value {
      .component {
        width: 320px;
      }

      .valid-border {
        .el-input__wrapper {
          border: 1px solid #f93f3f;
          box-shadow: 0 0 0 0;
        }

        .el-select__wrapper {
          border: 1px solid #f93f3f;
          box-shadow: 0 0 0 0;
        }
      }
    }

    .valid-tips {
      margin-left: 10px;
      height: 36px;
      line-height: 36px;
      overflow: hidden;
      font-size: 12px;
      color: #f93f3f
    }
  }
}
</style>