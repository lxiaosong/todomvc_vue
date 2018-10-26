(function (window, Vue, undefined) {
	new Vue({
		el: '#app',
		data: {
			dataList: JSON.parse(window.localStorage.getItem('dataList')) || [],
			newTodo: '',
			//编辑todo时的备份数据
			backup: {},
			//判断筛选按钮的选中状态
			flag: 1,
			//判断是否显示li时的bool数组
			showArr: []
		},
		methods: {
			//添加
			addTodo() {
				//输入为空时无法添加
				if (!this.newTodo.trim()) return;
				this.dataList.push({
					content: this.newTodo.trim(),
					isFinish: false,
					id: this.dataList.length ? this.dataList.sort((a, b) => a.id - b.id)[this.dataList.length - 1]['id'] + 1 : 1
				});
				this.newTodo = '';
			},
			//删除
			delTodo(index) {
				this.dataList.splice(index, 1);
			},
			//批量删除
			delAll() {
				this.dataList = this.dataList.filter(item => !item.isFinish);
			},
			//显示编辑框
			showEdit(index) {
				this.$refs.show.forEach(item => {
					item.classList.remove('editing');
				});
				this.$refs.show[index].classList.add('editing');
				this.$refs.text[index].focus();
				this.backup = JSON.parse(JSON.stringify(this.dataList[index]));
			},
			//完成编辑
			updateTodo(index) {
				if (!this.dataList[index].content.trim()) {
					return this.dataList.splice(index, 1);
				}
				if (this.dataList[index].content !== this.backup.content) {
					this.dataList[index].isFinish = false;
				}
				this.$refs.show[index].classList.remove('editing');
				this.backup = {};
			},
			//取消编辑
			unedit(index) {
				this.dataList[index].content = this.backup.content;
				this.$refs.show[index].classList.remove('editing');
				this.backup = {};
			},
			//根据hash改变，筛选列表显示
			hashchange() {
				switch (window.location.hash) {
					case '':
					case '#/':
						this.flag = 1;
						this.showAll();
						break;
					case '#/active':
						this.todoState(false);
						this.flag = 2;
						break;
					case '#/completed':
						this.todoState(true);
						this.flag = 3;
						break;
				}
			},
			//显示所有时的boo数组
			showAll() {
				this.showArr = this.dataList.map(() => true);
			},
			//筛选显示时的boo数组
			todoState(boo) {
				this.showArr = this.dataList.map(item => item.isFinish === boo);
				//筛选项的显示为空，则跳转为显示所有项
				if (this.dataList.every(item => item.isFinish === !boo)) return window.location.hash = '';
			}
		},
		//计算属性
		computed: {
			//未选中的数量
			activeNum() {
				return this.dataList.filter(item => !item.isFinish).length;
			},
			//全选按钮
			toggleAll: {
				get() {
					return this.dataList.every(item => item.isFinish);
				},
				set(val) {
					this.dataList.forEach(item => item.isFinish = val);
				}
			}
		},
		//监听
		watch: {
			//深度监听dataList改变
			dataList: {
				handler(newArr) {
					window.localStorage.setItem('dataList', JSON.stringify(newArr));
					this.hashchange();
				},
				deep: true
			}
		},
		//自定义指令
		directives: {
			//自动获取焦点
			focus: {
				inserted(el) {
					el.focus();
				}
			}
		},
		//生命周期
		created() {
			this.hashchange();
			//hash改变时触发!!!
			window.onhashchange = () => this.hashchange();
		}
	});
})(window, Vue);

// 1. 先要找到一个数组
//   1-1 先暂时自己创造一个数组
// 2. 当数组发生改变就再次存储回 localStorage 里面
//   2-1 只要数组改变就出发存储的行为
//   2-2 watch 深度监听
// 3. 自定义一个指令
//   3-1 自动获取光标
// 4. 添加一条数据
//   4-1 向数组的末尾追加一个对象
//   4-2 出现一个这样的对象
//   4-3 content： input 输入的内容
//   4-4 isFinish: false
//   4-5 id: 先排序（按照 id 的大小）,拿最后一个的id 去 + 1
// 5. 删除一个 todo
//   5-1 应该是使用 id
//   5-2 我们的渲染就是按照索引渲染的
//   5-3 视图和数据是配套的   0 ->  1     1 -> 2
//   5-4 可以直接根据索引来删除
// 6. 计算所有 isFinish 为 false 的数量
// 7. 让全部删除按钮显示和隐藏
//   7-1 如果 activeNum === dataList.length 说明都是 false 应该隐藏
//   7-2 如果不一致，就应该显示出来
// 8. 全部删除
//   8-1 删除的是，isFinish 为 true 的所有项
//   8-2 剩余的是，isFinish 为 false 的所有项
//   8-3 把所有 isFinish 为 false 的筛选出来重新复制给 dataList
// 9. 全选
//   9-1 使用计算属性，配合 every 方法计算出一个值，true or false
//   9-2 使用 v-model 绑定到 全选按钮上
//   9-3 当点击这个全选按钮的时候出发改变的行为，让数组中每一个选项的 isFinish 属性等于我的改变后的值
//   9-4 会导致计算属性的被计算项改变二重新计算，得到一个新的值
// 10. 显示编辑文本框
//   10-1 在双击的时候，让所有的 li 取消 editing 类名
//        捕获所有的 li
//        ref就类似于 class
//        $refs 不管你在那个位置执行，都能得到页面中所有的有 ref 属性的元素
//   10-2 让当前这个 li 添加 editing 类名（由index决定）
//        使用 $refs 获取所有的 li，让每一个 li 移除一个 editing 类名
//        使用 $refs 让当前的 li 添加 editing 类名
//   10-3 在编辑之前拷贝一份内容出来
//        JSON.parse(JSON.stringify(对象))
// 11. 真正编辑的时候
//   11-1 回车事件，需要传递 index
//   11-2 判断是否为空，根据 index 去删除当前想
//   11-3 判断和备份那个内容是否改变，改变了就把 isFinish 变成 false
//   11-4 让当前这个 li 把 editing 类名移除
//   11-5 清空备份
// 12. 还原内容，点击 esc 的时候
//   12-1 注册 esc 的键盘事件
//   12-2 把数组中当前想的内容变成 之前备份里面的内容
//   12-3 让当前这个 li 把 editing 类名移除
//   12-4 清空备份
// 13. 改变类名
//   13-1 依赖于一个 data 中的属性 1 2 3
//   13-2 通过 hashchange 这个事件来决定 data 中的属性是 1 2 3
//   13-3 一个 hashchange 事件在 onhashchange 事件中执行
//   13-4 在全局 created 里面执行
//   13-5 created 这个钩子函数就是创建了数据以后，还没有开始渲染页面之前
// 14. 根据 hash 的改变显示不一样的内容
//   14-1 all: 显示所有
//   14-2 active: 显示未完成
//   14-3 completed： 显示已经完成
