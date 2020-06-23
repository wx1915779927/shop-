<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" ref="cs" />
    </el-card>
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-pius"
          @click="showAdd"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table :data="attrs" border v-loading="loading">
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          />
          <el-table-column prop="attrName" label="属性名称" width="150" />
          <el-table-column label="属性值列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="info"
                v-for="value in row.attrValueList"
                :key="value.id"
                >{{ value.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <hint-button
                title="修改属性"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdate(row)"
              >
              </hint-button>
              <el-popconfirm
                :title="`确定删除 ${row.attrName} 吗?`"
                @onConfirm="deleteAttr(row.id)"
              >
                <hint-button
                  slot="reference"
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form inline>
          <el-form-item label="属性名">
            <el-input
              type="text"
              placeholder="请输入属性名"
              v-model="attr.attrName"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attr.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>

        <el-table border style="margin:20px 0" :data="attr.attrValueList">
          <el-table-column
            label="序号"
            width="80"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-if="row.edit"
                v-model="row.valueName"
                size="mini"
                placeholder="请输入名称"
                @blur="toList(row)"
                @keyup.enter.native="toList(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: inline-block; width: 100%"
              >
                {{ row.valueName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定删除 ${row.valueName} 吗?`"
                @onConfirm="attr.attrValueList.splice($index, 1)"
              >
                <hint-button
                  slot="reference"
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button
          type="primary"
          :disabled="!attr.attrName || attr.attrValueList.length === 0"
          @click="addOrUpdate"
          >保存
        </el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "AttrList",
  data() {
    return {
      loading: false, //是否正在加载
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrs: [],
      isShowList: true, //是否显示属性列表界面
      attr: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3
      }
    };
  },
  watch: {
    isShowList(value) {
      this.$refs.cs.disabled = !value;
    }
  },
  async mounted() {
    // const result = await this.$API.attr.getList(2, 13, 61);
    // console.log("result", result);
    // (this.category1Id = 2),
    //   (this.category2Id = 13),
    //   (this.category3Id = 61),
    //   this.getAttrs();
  },
  methods: {
    //删除列表数据
    async deleteAttr(id) {
      const { attr } = this;
      const result = await this.$API.attr.remove(id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.isShowList = true;
        this.getAttrs();
      } else {
        this.$message.error("删除失败");
      }
    },
    //添加或者更新的属性

    async addOrUpdate() {
      const { attr } = this;
      attr.attrValueList = attr.attrValueList.filter(attrValue => {
        if (attrValue.valueName) {
          delete attrValue.edit;
          return true;
        }
        return false;
      });
      if (attr.attrValueList.length === 0) {
        this.$message.warning("至少指定一个名称");
        return;
      }

      const result = await this.$API.attr.save(attr);
      if (result.code === 200) {
        this.$message.success("保存属性成功");
        this.isShowList = true;
        this.getAttrs();
      } else {
        this.$message.error("保存属性失败");
      }
    },
    /*
      将指定属性名称从编辑模式变为查看
      */
    toList(attrValue) {
      // 如果输入数据为空的, 那还是编辑模式
      if (attrValue.valueName.trim() === "") return;
      // 如果当前输入的与原本已有重复了, 那还是编辑模式并提示
      const isRepeat =
        this.attr.attrValueList.filter(
          value => value.valueName === attrValue.valueName
        ).length === 2;
      if (isRepeat) {
        this.$message.warning("属性名称不能重复");
        attrValue.valueName = ""; // 清除输入
        return;
      }

      // 更新edit属性为false
      attrValue.edit = false;
    },
    toEdit(attrValue, index) {
      if (attrValue.hasOwnProperty("edit")) {
        attrValue.edit = true;
      } else {
        this.$set(attrValue, "edit", true);
      }
      this.$nextTick(() => this.$refs[index].focus());
    },
    /*
          添加一个新的平台属性值
          */
    addAttrValue() {
      // 创建一个平台属性值对象
      const attrValue = {
        attrId: this.attr.id, // 当前要修改属性的id
        valueName: "", // 属性值名称
        edit: true // 标识为编辑模式
      };

      // 添加到对应的数组
      this.attr.attrValueList.push(attrValue);
      // 让最后一个输入框自动获得焦点
      this.$nextTick(() =>
        this.$refs[this.attr.attrValueList.length - 1].focus()
      );
    },

    showAdd() {
      this.attr = {
        attrName: "", // 属性名
        attrValueList: [], // 属性值列表
        categoryId: this.category3Id, // 当前第3级分类ID
        categoryLevel: 3 // 分类级别
      };
      // 显示界面
      this.isShowList = false;
    },

    showUpdate(attr) {
      // this.attr = attr;
      // this.attr = { ...attr };//对列表项进行浅克隆
      this.attr = cloneDeep(attr);
      this.isShowList = false;
    },

    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category2Id = null;
        this.category3Id = null;
        this.attrs = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = null;
        this.attrs = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getAttrs();
      }
    },
    async getAttrs() {
      const { category1Id, category2Id, category3Id } = this;
      this.loading = true;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      this.loading = false;
      this.attrs = result.data;
    }
  }
};
</script>
