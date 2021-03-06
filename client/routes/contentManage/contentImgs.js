import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Upload, Button, Input, Icon, Checkbox, Radio, Tooltip, Spin, message } from 'antd'
import classnames from 'classnames'
import styles from '../../components/commons.less'
import Message from '../../components/message'
import PopConfirm from '../../components/popconfirm'

const RadioGroup = Radio.Group;

/**
 * 图片下面的操作按钮组
 * @param {[type]} props [description]
 */
const ImgOpts = (props) => {
  const { ID, groupDatas, handleDel, onChangeGroup, handleChangeGroup, toNewGroupId } = props;
  const realGroup = groupDatas.filter((record) => {
    return record.ID !== 0;
  })
  const getPopContent = (type) => {
    if (type === 1) {
      return [
        <label key="label">编辑名称</label>,
        <div key="input" style={{ width: 200 }}>
          <Input size="large" defaultValue={props.file_origin_name} />
        </div>
      ];
    } else if (type === 2) {
      if (realGroup.length > 1) {
        return (
          <div className={styles.frm_control}>
            <RadioGroup onChange={(e) => { onChangeGroup(e.target.value) }} value={toNewGroupId}>
            {
              realGroup.map((record, index) => {
                return (
                  <Radio key={index} style={{ width: '46%' }} value={record.ID}>{record.group_name}</Radio>
                )
              })
            }
            </RadioGroup>
          </div>
        );
      } else {
        return (
          <div>你还没有任何分组。</div>
        )
      }
    } else {
      return <p>确定删除此素材吗？</p>
    }
  }

  const getPopupContainer = () => document.getElementById('imgsContent') || document.body;

  return (
    <ul className={classnames(styles.grid_line, styles.msg_card_opr_list)}>
      <li className={classnames(styles.grid_item, styles.msg_card_opr_item)}>
        <PopConfirm
          content={getPopContent(1)}
          getPopupContainer={getPopupContainer}
        >
          <span className={styles.msg_card_opr_item_inner}>
            <Tooltip title="编辑名称">
              <Icon type="edit" />
            </Tooltip>
          </span>
        </PopConfirm>
      </li>
      <li className={classnames(styles.grid_item, styles.msg_card_opr_item)}>
        <PopConfirm
          content={getPopContent(2)}
          getPopupContainer={getPopupContainer}
          overlayStyle={{ width: 252 }}
          onOk={() => {
            handleChangeGroup(ID)
          }}
        >
          <span className={styles.msg_card_opr_item_inner}>
            <Tooltip title="移动分组">
              <Icon type="swap" />
            </Tooltip>
          </span>
        </PopConfirm>
      </li>
      <li className={classnames(styles.grid_item, styles.msg_card_opr_item)}>
        <PopConfirm
          content={getPopContent(3)}
          getPopupContainer={getPopupContainer}
          onOk={() => { handleDel(props.ID); }}
        >
          <span className={styles.msg_card_opr_item_inner}>
            <Tooltip title="删除">
              <Icon type="delete" />
            </Tooltip>
          </span>
        </PopConfirm>
      </li>
    </ul>
  );
}


/**
 * 单个图片元素
 * @param {[type]} props [description]
 */
const ImgItem = (props) => {
  const { ID, state, handleCheck } = props;
  return (
    <li className={styles.img_item}>
      <div className={styles.img_item_bd}>
        <span
          className={styles.pic}
          style={{ backgroundImage: `url(api/contentImgs/getFile?file=${props.path})` }}
        />
        <span className={styles.check_content}>
          <Checkbox
            checked={state.checked}
            onChange={(e) => { handleCheck(ID, e.target.checked) }}
          >
          {props.file_origin_name}
          </Checkbox>
        </span>
      </div>
      <div className={styles.msg_card_ft}>
        <ImgOpts {...props} />
      </div>
    </li>
  );
}

ImgItem.propTypes = {
  ID: PropTypes.number.isRequired,
  file_name: PropTypes.string,
  file_origin_name: PropTypes.string
}

/**
 * 右边的图片组列表
 * @param {[type]} props [description]
 */
const GroupList = (props) => {
  const {
    data = [],
    current,
    newGroupName,
    onChangeNewGroupName,
    handleSwitch,
    handleCreateGroup
  } = props;
  const getPopupContainer = () => document.getElementById('imgsContent') || document.body;
  const getPopContent = () => {
    return [
      <label key="label">创建分组</label>,
      <div key="input" style={{ width: 200 }}>
        <Input
          size="large"
          value={newGroupName}
          onChange={(e) => { onChangeNewGroupName(e.target.value); }}
        />
      </div>
    ];
  }
  return (
    <div className={styles.group_list}>
      <div className={styles.inner_menu_box}>
        <dl className={styles.inner_menu}>
          {
            data.map((record) => {
              const className = classnames({
                [styles.inner_menu_item]: true,
                [styles.selected]: current.ID === record.ID
              });
              const handleClick = () => {
                handleSwitch(record.ID);
              }
              return (
                <dd key={record.ID} className={className}>
                  <a className={styles.inner_menu_link} onClick={handleClick}>
                    <strong>{record.group_name}</strong>
                    <em>({record.count})</em>
                  </a>
                </dd>
              );
            })
          }
        </dl>
      </div>
      <div className={styles.inner_menu_item}>
        <PopConfirm
          content={getPopContent()}
          getPopupContainer={getPopupContainer}
          onOk={() => { handleCreateGroup(newGroupName); }}
          onCancel={() => { onChangeNewGroupName('') }}
        >
          <a className={styles.inner_menu_link}>
            <Icon type="plus" /> 新建分组
          </a>
        </PopConfirm>
      </div>
    </div>
  );
}


/**
 * *******主体内容*******
 * [ContentImgs description]
 */
function ContentImgs({ dispatch, contentImgs, location }) {
  const {
    allChecked,
    indeterminate,
    imageDatas,
    checkedImgs,
    groupDatas,
    loading,
    currentGroup,
    newGroupName,
    toNewGroupId,
    optMessage,
    messageShowing,
    messageType
  } = contentImgs;
  const uploadProps = {
    name: 'file',
    action: './api/contentImgs/upload',
    accept: 'image/bmp,image/png,image/jpeg,image/jpg,image/gif',
    data: { groupId: currentGroup.ID > 0 ? currentGroup.ID : null },
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'uploading') {
        dispatch({
          type: 'contentManage/contentImgs/showLoading'
        });
      }
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        dispatch({
          type: 'contentManage/contentImgs/hideLoading'
        });
        dispatch({
          type: 'contentManage/contentImgs/init',
          payload: location.query
        })
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
        dispatch({
          type: 'contentManage/contentImgs/hideLoading'
        });
      }
    }
  }

  // 全选/反选 所有图片
  const onCheckAll = (e) => {
    dispatch({
      type: 'contentManage/contentImgs/checkAll',
      payload: e.target.checked
    });
  }
  // 切换图片分组
  const handleSwitch = (id) => {
    dispatch({
      type: 'contentManage/contentImgs/switchGroup',
      payload: id
    })
  }
  // 重命名图片分组
  const handleRenameGroup = (id, name) => {
    dispatch({
      type: 'contentManage/contentImgs/renameGroup',
      id,
      name
    });
  }
  // 删除图片分组
  const handleDeleteGroup = (id) => {
    dispatch({
      type: 'contentManage/contentImgs/deleteGroup',
      id
    });
  }
  // 创建分组
  const handleCreateGroup = (name) => {
    dispatch({
      type: 'contentManage/contentImgs/createGroup',
      payload: name
    })
  }
  // 修改新分组名
  const onChangeNewGroupName = (name) => {
    dispatch({
      type: 'contentManage/contentImgs/changeNewGroupName',
      payload: name
    })
  }
  // 批量删除图片
  const handleDelImgs = () => {
    dispatch({
      type: 'contentManage/contentImgs/delImgItems'
    })
  }
  // 要移动的分组
  const onChangeGroup = (id) => {
    dispatch({
      type: 'contentManage/contentImgs/toChangeCurGroup',
      id
    })
  }
  // 移动图片分组
  const handleChangeGroup = (imgId) => {
    dispatch({
      type: 'contentManage/contentImgs/changeGroup',
      imgId,
      groupId: toNewGroupId
    })
  }

  const imgItemProps = {
    groupDatas,
    toNewGroupId,
    // 单选一个图片元素
    handleCheck(ID, checked) {
      dispatch({
        type: 'contentManage/contentImgs/checkImgItem',
        payload: { ID, checked }
      });
    },
    // 删除一个图片元素
    handleDel(ID) {
      dispatch({
        type: 'contentManage/contentImgs/delImgItem',
        payload: ID
      });
    },
    onChangeGroup,
    handleChangeGroup
  };

  const getPopupContainer = () => document.getElementById('imgsContent') || document.body;
  const realGroup = groupDatas.filter((record) => {
    return record.ID !== 0;
  })

  return (
    <Spin spinning={loading}>
      <Message type={messageType} message={optMessage} showing={messageShowing} />
      <div className="content-inner" id="imgsContent">
        <div className={styles.img_pick_panel}>
          <div className={styles.inner_container_box}>
            <div className={styles.inner_main}>
              <div className={styles.bd}>
                <div className={styles.media_list}>
                  <div className={styles.media_title}>
                    <p>
                      <span>{currentGroup.group_name}</span>
                      {
                        // 重命名 & 删除 图片分组
                        currentGroup.ID > 0 ? [
                          <PopConfirm
                            key="rename"
                            content={
                              <Input
                                value={newGroupName || currentGroup.group_name}
                                onChange={(e) => { onChangeNewGroupName(e.target.value) }}
                              />
                            }
                            placement="bottom"
                            getPopupContainer={getPopupContainer}
                            onOk={() => { handleRenameGroup(currentGroup.ID, newGroupName) }}
                            onCancel={() => { onChangeNewGroupName('') }}
                          >
                            <a>重命名</a>
                          </PopConfirm>,
                          <PopConfirm
                            key="delete"
                            content="删除后的分组图片自动归于 未分组"
                            getPopupContainer={getPopupContainer}
                            onOk={() => { handleDeleteGroup(currentGroup.ID) }}
                          >
                            <a>删除</a>
                          </PopConfirm>
                        ] : false
                      }
                    </p>
                    <div className={styles.title_extra}>
                      <Upload {...uploadProps}>
                        <Button type="primary">
                          <Icon type="upload" /> 上传图片
                        </Button>
                      </Upload>
                    </div>
                  </div>
                  <div className={styles.media_tools}>
                    <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={onCheckAll}>全选</Checkbox>
                    <PopConfirm
                      content={
                        <div className={styles.frm_control}>
                          <RadioGroup onChange={(e) => { onChangeGroup(e.target.value) }} value={toNewGroupId}>
                          {
                            realGroup.map((record, index) => {
                              return (
                                <Radio key={index} style={{ width: '46%' }} value={record.ID}>{record.group_name}</Radio>
                              )
                            })
                          }
                          </RadioGroup>
                        </div>
                      }
                      getPopupContainer={getPopupContainer}
                      onOk={handleChangeGroup}
                    >
                      <Button disabled={!allChecked && !indeterminate}>移动分组</Button>
                    </PopConfirm>
                    <PopConfirm
                      content="确定删除这些素材吗？"
                      getPopupContainer={getPopupContainer}
                      onOk={handleDelImgs}
                    >
                      <Button disabled={!allChecked && !indeterminate}>删除</Button>
                    </PopConfirm>
                  </div>
                  <div className={styles.img_pick}>
                    <ul>
                      {
                        imageDatas.map((item) => {
                          const state = checkedImgs[item.ID];
                          return (
                            <ImgItem
                              key={item.ID}
                              {...item}
                              {...imgItemProps}
                              state={state}
                            />
                        );
                        })
                      }
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.inner_side}>
              <div className={styles.bd}>
                <GroupList
                  data={groupDatas}
                  newGroupName={newGroupName}
                  onChangeNewGroupName={onChangeNewGroupName}
                  current={currentGroup}
                  handleSwitch={handleSwitch}
                  handleCreateGroup={handleCreateGroup}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}

ContentImgs.propTypes = {
  contentImgs: PropTypes.object,
  dispatch: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    contentImgs: state['contentManage/contentImgs']
  };
}

export default connect(mapStateToProps)(ContentImgs)
